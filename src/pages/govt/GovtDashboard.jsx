import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck, MapPin, AlertTriangle, MessageSquareWarning, Activity, Sparkles, Send, Bell } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Tooltip as LeafletTooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

export default function GovtDashboard() {
  const { currentUser } = useAuth();
  const [selectedCity, setSelectedCity] = useState('All');
  
  const [hotspots, setHotspots] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New states for Emergency Broadcast
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  const CITIES = ['All', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai'];

  useEffect(() => {
    const hotspotsRef = collection(db, 'aqi_hotspots');
    const unsubHotspots = onSnapshot(hotspotsRef, (snapshot) => {
      setHotspots(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const complaintsRef = collection(db, 'complaints');
    const unsubComplaints = onSnapshot(complaintsRef, (snapshot) => {
      setComplaints(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });

    return () => {
      unsubHotspots();
      unsubComplaints();
    };
  }, []);

  const filteredHotspots = selectedCity === 'All' 
    ? hotspots 
    : hotspots.filter(h => h.city === selectedCity);

  const filteredComplaints = selectedCity === 'All'
    ? complaints
    : complaints.filter(c => c.city === selectedCity);

  const unresolvedComplaints = filteredComplaints.filter(c => c.status === 'Pending').length;
  const activeHotspotsCount = filteredHotspots.length;
  
  const avgAqi = activeHotspotsCount > 0 
    ? Math.round(filteredHotspots.reduce((sum, h) => sum + (Number(h.aqi) || 0), 0) / activeHotspotsCount)
    : 0;

  // Process data for charts
  const causeCount = {};
  filteredHotspots.forEach(h => {
    const cause = h.cause || 'Unknown';
    causeCount[cause] = (causeCount[cause] || 0) + 1;
  });

  const chartData = Object.keys(causeCount).map(key => ({
    name: key,
    value: causeCount[key]
  })).sort((a, b) => b.value - a.value);

  const forecastData = [
    { time: '00:00', aqi: 80 }, { time: '02:00', aqi: 85 }, { time: '04:00', aqi: 110 }, { time: '06:00', aqi: 150 },
    { time: '08:00', aqi: 240 }, { time: '10:00', aqi: 220 }, { time: '12:00', aqi: 190 }, { time: '14:00', aqi: 150 },
    { time: '16:00', aqi: 160 }, { time: '18:00', aqi: 250 }, { time: '20:00', aqi: 280 }, { time: '22:00', aqi: 180 },
  ];

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setBroadcastSending(true);
    try {
      await addDoc(collection(db, 'broadcasts'), {
        message: broadcastMsg,
        city: selectedCity,
        timestamp: serverTimestamp(),
        active: true
      });
      setBroadcastSuccess('Critical alert broadcasted successfully!');
      setBroadcastMsg('');
      setTimeout(() => setBroadcastSuccess(''), 3000);
    } catch (err) {
      console.error('Error sending broadcast:', err);
    } finally {
      setBroadcastSending(false);
    }
  };
  const getMarkerIcon = (aqi) => {
    if (aqi <= 100) return iconGreen;
    if (aqi <= 200) return iconYellow;
    return iconRed;
  };

  const getCategoryColor = (aqi) => {
    if (aqi <= 100) return 'text-emerald-600';
    if (aqi <= 200) return 'text-amber-600';
    return 'text-red-600';
  };


  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" size={32} />
            Command Center
          </h1>
          <p className="text-slate-500 mt-2">
            Central orchestration hub for environmental policy and intervention.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <span className="text-sm font-medium text-slate-500 ml-2">Jurisdiction:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="pl-2 pr-8 py-1.5 border-none bg-transparent font-bold text-slate-800 outline-none focus:ring-0 cursor-pointer"
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>



      {/* Top Row: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-indigo-50 opacity-50 group-hover:scale-110 transition-transform">
            <Activity size={120} />
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl relative z-10">
            <Activity size={28} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">City Avg AQI</p>
            <h3 className={`text-4xl font-bold mt-1 ${avgAqi > 200 ? 'text-red-600' : avgAqi > 100 ? 'text-amber-500' : 'text-emerald-600'}`}>
              {avgAqi}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-slate-50 opacity-50 group-hover:scale-110 transition-transform">
            <MapPin size={120} />
          </div>
          <div className="p-4 bg-slate-100 text-slate-600 rounded-2xl relative z-10">
            <MapPin size={28} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Hotspots</p>
            <h3 className="text-4xl font-bold text-slate-800 mt-1">{activeHotspotsCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-amber-50 opacity-50 group-hover:scale-110 transition-transform">
            <MessageSquareWarning size={120} />
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl relative z-10">
            <MessageSquareWarning size={28} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unresolved Complaints</p>
            <h3 className="text-4xl font-bold text-slate-800 mt-1">{unresolvedComplaints}</h3>
          </div>
        </div>
      </div>

      {/* Middle Row: Map & Source Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Col: Leaflet Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[500px]">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="text-indigo-600" size={20} />
            <h2 className="text-xl font-bold text-slate-800">Live Territory Map</h2>
          </div>
          
          <div className="w-full flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner min-h-[400px]">
            <MapContainer
              center={[28.7041, 77.1025]}
              zoom={10}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredHotspots.map((spot) => {
                // strict coordinate handling as required:
                const lat = spot.location ? (spot.location.latitude || spot.location._lat) : (spot.lat || (spot.coordinates && spot.coordinates[0]));
                const lng = spot.location ? (spot.location.longitude || spot.location._long) : (spot.lng || (spot.coordinates && spot.coordinates[1]));

                if (!lat || !lng) return null;

                const aqi = Number(spot.aqi);
                if (isNaN(aqi)) return null;

                let circleColor = '#10b981';
                if (aqi > 200) circleColor = '#ef4444';
                else if (aqi > 100) circleColor = '#f59e0b';

                return (
                  <React.Fragment key={spot.id}>
                    <Circle
                      center={[lat, lng]}
                      radius={3000}
                      pathOptions={{ color: circleColor, fillColor: circleColor, fillOpacity: 0.4 }}
                    />
                    <Marker position={[lat, lng]} icon={getMarkerIcon(aqi)}>
                      <LeafletTooltip permanent direction="top" className="font-bold border-0 bg-white/90 shadow-sm rounded-md px-2 py-1">
                        {spot.name || 'Zone'} ({aqi > 200 ? 'Severe' : aqi > 100 ? 'Moderate' : 'Good'})
                      </LeafletTooltip>
                      <Popup className="rounded-xl shadow-sm border-0">
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2 text-lg">
                            {spot.name || 'Unknown Location'}
                          </h3>
                          <div className="space-y-2 text-sm">
                            <p className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">AQI Element:</span>
                              <span className={`font-bold text-lg ${getCategoryColor(aqi)}`}>{aqi}</span>
                            </p>
                            <p className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">Primary Cause:</span>
                              <span className="font-semibold text-slate-800">{spot.cause || 'Unknown'}</span>
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Right Col: Pie Chart */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[500px]">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-indigo-600" size={20} />
            <h2 className="text-xl font-bold text-slate-800">Source Identification</h2>
          </div>
          
          <div className="flex-1 w-full min-h-[350px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ bottom: 30 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value, entry) => <span className="text-sm font-medium text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No active hotspot data to analyze.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 24-Hour AI AQI Forecast */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-indigo-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">24-Hour AI AQI Forecast</h2>
        </div>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
              <RechartsTooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAqi)" activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
