import React, { useState, useEffect } from 'react';
// Navbar removed since Layout wraps this
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Popup, Circle } from 'react-leaflet';
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
  const navigate = useNavigate();

  useEffect(() => {
    const hotspotsCollection = collection(db, 'aqi_hotspots');
    const unsubscribe = onSnapshot(hotspotsCollection, (snapshot) => {
      const hotspotsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHotspots(hotspotsData);
    });

    return () => unsubscribe();
  }, []);

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
              Welcome to the Citizen Panel
            </h1>
            <p className="text-gray-600 mt-1">Hello, {currentUser?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0F172A] hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
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

              {hotspots.map((spot) => {
                const aqi = Number(spot.aqi);
                let pathOptions = { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.4 };
                if (aqi > 200) {
                  pathOptions = { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4 };
                } else if (aqi > 100) {
                  pathOptions = { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.4 };
                }

                const lat = parseFloat(spot.lat || (spot.coordinates && spot.coordinates[0]));
                const lng = parseFloat(spot.lng || (spot.coordinates && spot.coordinates[1]));

                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <Circle
                    key={spot.id}
                    center={[lat, lng]}
                    radius={3000}
                    pathOptions={pathOptions}
                  >
                    <Popup className="rounded-lg shadow-sm border-0">
                      <div className="p-1 min-w-[200px]">
                        <h3 className="font-bold text-[#0F172A] border-b border-gray-100 pb-2 mb-2 text-lg">
                          {spot.name || 'Unknown Location'}
                        </h3>
                        <div className="space-y-1.5 text-sm">
                          <p className="flex justify-between items-center gap-4">
                            <span className="text-gray-500 font-medium">AQI Element:</span>
                            <span className={`font-bold text-lg ${getCategoryColor(Number(spot.aqi))}`}>
                              {spot.aqi}
                            </span>
                          </p>
                          <p className="flex justify-between items-center gap-4">
                            <span className="text-gray-500 font-medium">Category:</span>
                            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${Number(spot.aqi) > 200 ? 'bg-red-50 text-red-700' :
                                Number(spot.aqi) > 100 ? 'bg-amber-50 text-amber-700' :
                                  'bg-emerald-50 text-emerald-700'
                              }`}>
                              {spot.category || (Number(spot.aqi) > 200 ? 'High Risk' : Number(spot.aqi) > 100 ? 'Moderate' : 'Good')}
                            </span>
                          </p>
                          {spot.cause && (
                            <div className="mt-3 pt-2 border-t border-gray-50">
                              <span className="block text-xs text-gray-400 font-medium mb-1">PRIMARY CAUSE</span>
                              <span className="block text-sm text-slate-700">{spot.cause}</span>
                            </div>
                          )}
                        </div>
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
