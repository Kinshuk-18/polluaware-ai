import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../services/firebase';
import { collection, onSnapshot, query, where, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Popup, Circle, Marker, Tooltip } from 'react-leaflet';
import { MapPin, AlertTriangle, Activity, LogOut, Bell, ShieldAlert, AlertOctagon, Navigation2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on category
const createCustomIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const iconRed = createCustomIcon('#EF4444');
const iconYellow = createCustomIcon('#F59E0B');
const iconGreen = createCustomIcon('#10B981');

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const [hotspots, setHotspots] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [userName, setUserName] = useState('');

  const [vulnerabilities, setVulnerabilities] = useState({ asthma: false, elderly: false, infant: false });
  const [broadcast, setBroadcast] = useState(null);
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [redZoneAlert, setRedZoneAlert] = useState(null);

  const [isCityLoading, setIsCityLoading] = useState(true);
  const navigate = useNavigate();

  const cities = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai'];

  useEffect(() => {
    const fetchUserCityAndName = async () => {
      if (currentUser?.uid) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.city) setSelectedCity(data.city);
            if (data.name) setUserName(data.name);
            setVulnerabilities({
              asthma: !!data.asthma,
              elderly: !!data.elderly,
              infant: !!data.infant
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setIsCityLoading(false);
    };
    fetchUserCityAndName();
  }, [currentUser]);

  useEffect(() => {
    if (isCityLoading) return;

    const hotspotsCollection = collection(db, 'aqi_hotspots');
    const q = query(hotspotsCollection, where('city', '==', selectedCity));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hotspotsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHotspots(hotspotsData);
    });

    return () => unsubscribe();
  }, [selectedCity, isCityLoading]);

  // Broadcast Listener
  useEffect(() => {
    if (isCityLoading) return;
    const broadcastsRef = collection(db, 'broadcasts');
    const q = query(broadcastsRef, where('city', '==', selectedCity));

    const unsubBroadcast = onSnapshot(q, (snapshot) => {
      // 1. Get ALL alerts for the city, active or inactive
      const allAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. Sort them newest to oldest
      allAlerts.sort((a, b) => {
        const tA = a.timestamp?.toMillis() || 0;
        const tB = b.timestamp?.toMillis() || 0;
        return tB - tA;
      });

      // 3. Save the full history for the dropdown list
      setBroadcastHistory(allAlerts);

      // 4. Find if there is currently an active one for the massive red banner
      const activeAlert = allAlerts.find(a => a.active === true);
      setBroadcast(activeAlert || null);

      // 5. UNREAD BADGE LOGIC: Check if they've seen this specific alert
      if (activeAlert) {
        const lastReadId = localStorage.getItem('lastReadAlertId');
        if (activeAlert.id !== lastReadId) {
          setHasUnread(true); // It's a new alert! Show the red dot.
        }
      } else {
        setHasUnread(false); // No active alerts
      }
    }, (err) => {
      console.error('Error fetching broadcasts:', err);
    });

    const handleToggleNotifications = () => {
      setShowNotifications(!showNotifications);

      // If they are opening the menu and there is an active broadcast, mark it as read
      if (!showNotifications && broadcast) {
        setHasUnread(false);
        localStorage.setItem('lastReadAlertId', broadcast.id);
      }
    };

    return () => unsubBroadcast();
  }, [selectedCity, isCityLoading]);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);

    if (!showNotifications && broadcast) {
      setHasUnread(false);
      localStorage.setItem('lastReadAlertId', broadcast.id);
    }
  };
  // Distance Calculation
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleCheckLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setCheckingLocation(true);
    setRedZoneAlert(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCheckingLocation(false);
        const { latitude, longitude } = position.coords;
        let foundRedZone = null;

        for (const spot of hotspots) {
          const lat = spot.location ? (spot.location.latitude || spot.location._lat) : null;
          const lng = spot.location ? (spot.location.longitude || spot.location._long) : null;
          const aqi = Number(spot.aqi);

          if (lat && lng && aqi > 200) {
            const distance = calculateDistance(latitude, longitude, lat, lng);
            if (distance <= 3) {
              foundRedZone = spot;
              break;
            }
          }
        }

        if (foundRedZone) {
          setRedZoneAlert(foundRedZone);
        } else {
          alert("You are currently outside of any severe high-pollution Red Zones.");
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setCheckingLocation(false);
        alert("Failed to access your location data.");
      }
    );
  };

  // Calculate metrics
  const totalHotspots = hotspots.length;
  const avgAqi = totalHotspots > 0
    ? Math.round(hotspots.reduce((sum, spot) => sum + (Number(spot.aqi) || 0), 0) / totalHotspots)
    : 0;

  let highestRiskArea = 'N/A';
  let highestAqi = -1;
  hotspots.forEach(spot => {
    if (Number(spot.aqi) > highestAqi) {
      highestAqi = Number(spot.aqi);
      highestRiskArea = spot.name || spot.city || 'Unknown Location';
    }
  });

  return (
    <div className="min-h-screen flex flex-col relative">

      {/* Red Zone Modal */}
      {redZoneAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4">
          <div className="bg-red-600 w-full max-w-lg rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-90 duration-300">
            <ShieldAlert className="w-24 h-24 text-white mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-4">🛑 DANGER</h2>
            <p className="text-xl text-red-50 font-medium mb-8 leading-relaxed">
              You have entered a severe pollution Red Zone (<strong className="text-white underline">{redZoneAlert.name || redZoneAlert.city}</strong>). Immediate masking is required.
            </p>
            <button
              onClick={() => setRedZoneAlert(null)}
              className="bg-white text-red-700 font-bold px-8 py-4 w-full rounded-2xl hover:bg-red-50 transition-colors shadow-lg text-lg"
            >
              I Understand, Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Banner */}
      {broadcast && (
        <div className="bg-red-600 text-white w-full py-4 px-6 shadow-md flex items-center justify-center gap-3 relative z-50 animate-in slide-in-from-top">
          <AlertOctagon className="h-8 w-8 animate-pulse text-white shrink-0" />
          <p className="text-lg md:text-2xl font-black uppercase tracking-wide">
            🚨 EMERGENCY ALERT: {broadcast.message}
          </p>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1">

        {/* Personalized Health Banner */}
        {avgAqi > 150 && (vulnerabilities.asthma || vulnerabilities.elderly || vulnerabilities.infant) && (
          <div className="mb-8 bg-orange-50 border-l-4 border-orange-500 p-5 rounded-r-xl shadow-sm flex items-start gap-4 animate-in slide-in-from-top-4">
            <div className="p-2 bg-orange-100 rounded-lg shrink-0">
              <AlertTriangle className="text-orange-600 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-900 mb-1">⚠️ Health Advisory: High AQI Detected</h3>
              <p className="text-orange-800 font-medium leading-relaxed">
                As a registered citizen with health vulnerabilities, please take precautions:
                {vulnerabilities.asthma && " Keep your inhaler accessible and minimize outdoor activity."}
                {vulnerabilities.elderly && " Ensure elderly household members remain indoors."}
                {vulnerabilities.infant && " Avoid taking infants/toddlers outside."}
              </p>
            </div>
          </div>
        )}

        {/* Top Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">
              Welcome back, {userName || 'Citizen'}
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Here is your real-time pollution overview for {selectedCity}.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleCheckLocation}
              disabled={checkingLocation}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-bold rounded-lg hover:bg-red-100 transition shadow-sm disabled:opacity-70"
            >
              <Navigation2 size={18} className={checkingLocation ? 'animate-spin' : ''} />
              {checkingLocation ? 'Checking...' : 'Check My Location'}
            </button>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 bg-white"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Interactive Notification Center */}
            <div className="relative">
              <button
                onClick={handleToggleNotifications}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors focus:outline-none"
              >
                <Bell size={24} />
                {hasUnread && (
                  <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              {/* The Dropdown Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-[#0F172A]">Notification Center</h3>
                    <span className="text-xs font-bold bg-[#0F172A] text-white px-2 py-1 rounded-full">
                      {broadcastHistory.length}
                    </span>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {broadcastHistory.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">No recent alerts for your city.</div>
                    ) : (
                      broadcastHistory.map((alert) => (
                        <div key={alert.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${alert.active ? 'bg-red-50/30' : ''}`}>
                          <div className="flex gap-3">
                            <div className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${alert.active ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
                            <div>
                              <p className={`text-sm ${alert.active ? 'font-extrabold text-red-700' : 'text-slate-800 font-semibold'}`}>
                                {alert.active ? '🚨 EMERGENCY ALERT' : 'Past Alert'}
                              </p>
                              <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                              <p className="text-xs text-slate-400 mt-2 font-medium">
                                {alert.timestamp ? new Date(alert.timestamp.toDate()).toLocaleString() : 'Just now'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0F172A] hover:bg-slate-800 transition-colors shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={`p-4 rounded-xl ${avgAqi > 200 ? 'bg-red-50 text-red-600' : avgAqi > 100 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">City-Wide AQI</p>
              <h3 className="text-2xl font-bold text-[#0F172A]">{avgAqi}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="p-4 rounded-xl bg-orange-50 text-orange-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Highest Risk Area</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-xl font-bold text-[#0F172A] truncate max-w-[140px]" title={highestRiskArea}>
                  {highestRiskArea}
                </h3>
                {highestAqi > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-sm font-bold shadow-sm">
                    {highestAqi} AQI
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
              <MapPin className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Hotspots Tracked</p>
              <h3 className="text-2xl font-bold text-[#0F172A]">{totalHotspots}</h3>
            </div>
          </div>
        </div>

        {/* Main Content: Leaflet Map */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8 flex-col">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-[#0F172A]" />
            <h2 className="text-xl font-bold text-[#0F172A]">Real-Time Pollution Map</h2>
          </div>

          <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-inner border border-gray-200">
            <MapContainer
              center={[28.7041, 77.1025]}
              zoom={10}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {hotspots.map((spot) => {
                const lat = spot.location ? (spot.location.latitude || spot.location._lat) : null;
                const lng = spot.location ? (spot.location.longitude || spot.location._long) : null;
                const aqi = Number(spot.aqi);

                if (!lat || !lng || isNaN(aqi)) return null;

                let circleColor = '#10b981'; // Green
                if (aqi > 200) circleColor = '#ef4444'; // Red
                else if (aqi > 100) circleColor = '#f59e0b'; // Yellow

                return (
                  <Circle
                    key={spot.id}
                    center={[lat, lng]}
                    radius={3000}
                    pathOptions={{ color: circleColor, fillColor: circleColor, fillOpacity: 0.5 }}
                  >
                    <Popup className="rounded-lg shadow-sm border-0">
                      <div className="p-1 min-w-[200px]">
                        <h3 className="font-bold text-[#0F172A] border-b border-gray-100 pb-2 mb-2 text-lg">
                          {spot.name || 'Unknown Location'}
                        </h3>
                        <p className="font-medium text-gray-600 mb-1">
                          AQI: <span className="font-bold" style={{ color: circleColor }}>{aqi}</span>
                        </p>
                        <p className="text-sm text-gray-500 mb-2">Status: {spot.category}</p>
                        {spot.cause && (
                          <p className="text-xs text-gray-400 border-t pt-2 mt-2">
                            Cause: <span className="text-gray-600">{spot.cause}</span>
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </main>
    </div>
  );
}