import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { MapPin, Search, Filter, ShieldAlert, Activity, AlertTriangle } from 'lucide-react';

export default function HotspotList() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');

  const CITIES = ['All', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai'];

  useEffect(() => {
    const hotspotsRef = collection(db, 'aqi_hotspots');
    const unsubscribe = onSnapshot(hotspotsRef, (snapshot) => {
      let docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort normally by AQI descending
      docs.sort((a, b) => (Number(b.aqi) || 0) - (Number(a.aqi) || 0));
      
      setHotspots(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredHotspots = selectedCity === 'All' 
    ? hotspots 
    : hotspots.filter(h => h.city === selectedCity);

  const getCategoryColor = (aqi) => {
    const val = Number(aqi);
    if (val <= 100) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (val <= 200) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getAqiTextColor = (aqi) => {
    const val = Number(aqi);
    if (val <= 100) return 'text-emerald-600';
    if (val <= 200) return 'text-amber-600';
    return 'text-red-600';
  };

  const severeCount = filteredHotspots.filter(h => Number(h.aqi) > 200).length;
  const avgAqi = filteredHotspots.length > 0
    ? Math.round(filteredHotspots.reduce((sum, h) => sum + (Number(h.aqi) || 0), 0) / filteredHotspots.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-indigo-600" size={32} />
            Active Hotspot Directory
          </h1>
          <p className="text-slate-500 mt-2">
            Detailed registry of all monitored pollution nodes and standard AQI measurements.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <Filter size={18} className="text-slate-400 ml-2" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="pl-2 pr-8 py-1.5 border-none bg-transparent font-medium text-slate-700 outline-none focus:ring-0 cursor-pointer"
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Monitored Nodes</p>
            <h3 className="text-2xl font-bold text-slate-800">{filteredHotspots.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Severe Zones (AQI &gt; 200)</p>
            <h3 className="text-2xl font-bold text-slate-800">{severeCount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Average Node AQI</p>
            <h3 className={`text-2xl font-bold ${getAqiTextColor(avgAqi)}`}>{avgAqi}</h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Area Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">City</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Current AQI</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Category</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Cause</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-4">Loading hotspot networks...</p>
                  </td>
                </tr>
              ) : filteredHotspots.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-600">No hotspots found</p>
                    <p className="text-sm">No telemetry data matching the current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredHotspots.map((hotspot) => {
                  const aqiValue = Number(hotspot.aqi);
                  const defaultCategory = aqiValue > 200 ? 'High Risk' : aqiValue > 100 ? 'Moderate' : 'Good';
                  
                  return (
                    <tr key={hotspot.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800">{hotspot.name || 'Unknown Location'}</div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">
                          {hotspot.lat || (hotspot.coordinates && hotspot.coordinates[0])}, {hotspot.lng || (hotspot.coordinates && hotspot.coordinates[1])}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                        {hotspot.city || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-xl font-bold flex items-center gap-2 ${getAqiTextColor(aqiValue)}`}>
                          <Activity size={16} />
                          {hotspot.aqi}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(aqiValue)}`}>
                          {hotspot.category || defaultCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {hotspot.cause ? (
                          <span className="inline-block bg-slate-100 rounded-md px-2.5 py-1 font-medium">{hotspot.cause}</span>
                        ) : 'Pending Analysis'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
