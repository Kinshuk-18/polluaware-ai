import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AIPolicyEngine() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hotspotsRef = collection(db, 'aqi_hotspots');
    const unsubscribe = onSnapshot(hotspotsRef, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHotspots(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const topHotspots = [...hotspots]
    .sort((a, b) => (Number(b.aqi) || 0) - (Number(a.aqi) || 0))
    .slice(0, 3);

  const getCategoryColor = (aqi) => {
    if (aqi <= 100) return 'text-emerald-600';
    if (aqi <= 200) return 'text-amber-600';
    return 'text-red-600';
  };

  const generateActionRecommendation = (cause, aqi) => {
    if (cause?.includes('Stubble')) return 'Deploy immediate satellite monitoring, dispatch mobile firefighting units, and enforce strict penalties in the surrounding agricultural sectors.';
    if (cause?.includes('Construction')) return 'Deploy anti-smog guns, halt local construction activities immediately, and issue fines for uncovered raw materials.';
    if (cause?.includes('Vehicular')) return 'Divert heavy commercial traffic, increase frequency of public transport, and activate dynamic toll pricing on key arteries.';
    if (cause?.includes('Industrial')) return 'Dispatch inspection teams to nearby factories, temporarily shut down non-compliant units, and enforce strict emission scrubbing protocols.';
    if (aqi > 200) return 'Initiate emergency protocol GRAP Stage III. Deploy water sprinklers, ban non-essential construction, and mandate remote work where possible.';
    return 'Increase monitoring frequency and deploy additional mobile air quality testing units to pinpoint exact point sources.';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Sparkles className="text-indigo-600" size={32} />
          AI Policy Suggestions & Hotspot Interventions
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Dynamic, intelligence-driven automated policy prescriptions targeting the three most critical ecological risk zones across all jurisdictions.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
        </div>
      ) : topHotspots.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <Sparkles className="mx-auto h-16 w-16 text-indigo-200 mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">No Critical Zones Identified</h2>
          <p className="text-slate-500 mt-2">The AI policy engine is idle. No severe telemetry data currently requires automated intervention protocols.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topHotspots.map((spot, index) => {
            const aqi = Number(spot.aqi);
            return (
              <div 
                key={spot.id} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 relative overflow-hidden group hover:shadow-lg hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-indigo-400 to-indigo-600 opacity-80"></div>
                
                <div className="flex items-start justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
                    Priority Rank #{index + 1}
                  </span>
                  <span className={`font-black text-2xl tracking-tight ${getCategoryColor(aqi)}`}>
                    AQI {aqi}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-6 leading-snug">
                  AI Alert for {spot.name || 'Unknown Zone'}
                  <span className="block text-sm font-medium text-slate-500 mt-1">Severe Critical AQI Detected</span>
                </h3>
                
                <div className="space-y-6 text-sm">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500" />
                      Probable Cause
                    </p>
                    <p className="text-base font-semibold text-slate-800">{spot.cause || 'Unknown / Mixed Sources'}</p>
                  </div>
                  
                  <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                    <p className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ShieldCheck size={16} />
                      Recommended Action
                    </p>
                    <p className="text-base font-medium text-indigo-900 leading-relaxed">
                      {generateActionRecommendation(spot.cause, aqi)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
