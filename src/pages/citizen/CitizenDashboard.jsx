import React, { useState, useEffect } from 'react';
// Navbar removed since Layout wraps this
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../services/firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Popup, Circle, Marker, Tooltip } from 'react-leaflet';
import { MapPin, AlertTriangle, Activity, LogOut } from 'lucide-react';
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

const iconRed = createCustomIcon('#EF4444'); // Tailwind Red-500
const iconYellow = createCustomIcon('#F59E0B'); // Tailwind Amber-500
const iconGreen = createCustomIcon('#10B981'); // Tailwind Emerald-500

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const [hotspots, setHotspots] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [userName, setUserName] = useState('');
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
            // Grab the city for the filter
            if (data.city) {
              setSelectedCity(data.city);
            }
            // Grab the name for the greeting
            if (data.name) {
              setUserName(data.name);
            }
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
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

  const getCategoryColor = (aqi) => {
    if (aqi <= 100) return 'text-emerald-600';
    if (aqi <= 200) return 'text-amber-600';
    return 'text-red-600';
  };

  const getMarkerIcon = (aqi) => {
    if (aqi <= 100) return iconGreen;
    if (aqi <= 200) return iconYellow;
    return iconRed;
  };

  return (
    <div className="min-h-screen flex flex-col">

      <main className="max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1">
        {/* Top Navigation: Clean header with Welcome message and Logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">
              Welcome back, {userName || 'Citizen'}
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Here is your real-time pollution overview for {selectedCity}.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 bg-white"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0F172A] hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Current Average AQI */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={`p-4 rounded-xl ${avgAqi > 200 ? 'bg-red-50 text-red-600' : avgAqi > 100 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">City-Wide AQI</p>
              <h3 className="text-2xl font-bold text-[#0F172A]">{avgAqi}</h3>
            </div>
          </div>

          {/* Card 2: Highest Risk Area */}
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

          {/* Card 3: Total Hotspots Tracked */}
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
              {console.log("Hotspots loaded for map:", hotspots)}

              {hotspots.map((spot) => {
                // 1. Correctly extract from a Firestore GeoPoint Object
                // We check both standard 'latitude' and the private '_lat' just in case of serialization differences
                const lat = spot.location ? (spot.location.latitude || spot.location._lat) : null;
                const lng = spot.location ? (spot.location.longitude || spot.location._long) : null;
                const aqi = Number(spot.aqi);

                // 2. Safety check: If no valid coordinates, skip drawing
                if (!lat || !lng || isNaN(aqi)) return null;

                // 3. Color Logic
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