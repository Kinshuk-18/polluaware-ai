import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Search, Filter, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

export default function SourceIdentification() {
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
      setHotspots(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredHotspots = selectedCity === 'All' 
    ? hotspots 
    : hotspots.filter(h => h.city === selectedCity);

  // Deep dive bar chart logic
  const causeCount = {};
  filteredHotspots.forEach(h => {
    const cause = h.cause || 'Unknown';
    causeCount[cause] = (causeCount[cause] || 0) + 1;
  });

  const chartData = Object.keys(causeCount).map(key => ({
    name: key,
    Volumes: causeCount[key]
  })).sort((a, b) => b.Volumes - a.Volumes);

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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <PieChartIcon className="text-blue-600" size={32} />
            Detailed Source Analysis
          </h1>
          <p className="text-slate-500 mt-2">
            Deep-dive Analytics into Primary Pollution Drivers per Jurisdiction.
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

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Section 1: Deep-Dive Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="text-blue-500" size={20} />
              Volumetric Analysis by Emission Source
            </h2>
            <div className="w-full h-[400px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 0,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      tickMargin={15}
                      angle={-35}
                      textAnchor="end"
                      height={80}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      allowDecimals={false}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="Volumes" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                  No statistical data available for the selected region.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Area-Specific Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Search className="text-slate-400" size={20} />
                Area-Specific Hotspots
              </h2>
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 py-1 px-3 rounded-full">
                {filteredHotspots.length} Active Node{filteredHotspots.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-white">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Area Name</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Current AQI</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Category</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Source</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredHotspots.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                        No hotspots found match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredHotspots
                      .sort((a, b) => (Number(b.aqi) || 0) - (Number(a.aqi) || 0))
                      .map((hotspot) => {
                        const aqiValue = Number(hotspot.aqi);
                        const defaultCategory = aqiValue > 200 ? 'High Risk' : aqiValue > 100 ? 'Moderate' : 'Good';
                        
                        return (
                          <tr key={hotspot.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-slate-800">{hotspot.name || 'Unknown Location'}</div>
                              <div className="text-xs text-slate-500 mt-1">{hotspot.city || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-xl font-bold ${getAqiTextColor(aqiValue)}`}>
                                {hotspot.aqi}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getCategoryColor(aqiValue)}`}>
                                {hotspot.category || defaultCategory}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                {hotspot.cause || 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
