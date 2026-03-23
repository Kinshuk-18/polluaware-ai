import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Route as RouteIcon,
  Sparkles,
  Clock,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export default function SmartRoute() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!source || !destination) return;

    setLoading(true);
    setResult(null);

    // Simulate AI analysis delay
    setTimeout(() => {
      setLoading(false);
      setResult(true);
    }, 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Sparkles className="text-blue-600" size={32} />
          Smart Route AI
        </h1>
        <p className="text-slate-500 mt-2">
          Find the safest path to your destination by avoiding high pollution zones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Navigation size={20} className="text-slate-400" />
              Plan Your Trip
            </h2>

            <form onSubmit={handleAnalyze} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="E.g., Connaught Place"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-red-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="E.g., Cyber Hub"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !source || !destination}
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 group mt-4"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="animate-spin text-blue-400" size={20} />
                    Analyzing Data...
                  </span>
                ) : (
                  <>
                    <Sparkles size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    Get AI Route Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] animate-pulse">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="text-blue-500 animate-bounce" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">AI analyzing real-time AQI data...</h3>
              <p className="text-slate-500 text-center max-w-sm">
                Processing meteorological data, traffic conditions, and evaluating 150+ pollution nodes.
              </p>

              {/* Skeletons */}
              <div className="w-full flex flex-col gap-4 mt-8">
                <div className="h-28 bg-slate-200 rounded-xl w-full"></div>
                <div className="h-28 bg-slate-200 rounded-xl w-full"></div>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
              <RouteIcon size={64} className="text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Guide You</h3>
              <p className="text-slate-500 max-w-md">
                Enter your source and destination to let our AI calculate the most health-optimized route for your journey.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              {/* Dynamic Warning */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Sparkles className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">AI Health Insight</h4>
                  <p className="text-blue-800 text-sm">
                    <strong>AI Forecast:</strong> Current PM2.5 levels are peaking due to morning traffic.
                    Delaying departure by 20 minutes will reduce exposure by 18%.
                  </p>
                </div>
              </div>

              {/* Standard Route Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-slate-300"></div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                      Standard Route
                    </h3>
                    <p className="text-slate-500 text-sm font-medium">Fastest Route</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-xl text-slate-800">
                      <Clock size={20} className="text-slate-400" />
                      35 mins
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Warning: High Exposure</p>
                    <p className="text-xs mt-1 text-red-500">Crosses 2 Severe Red Zones (AQI &gt; 300).</p>
                  </div>
                </div>
              </div>

              {/* AI Optimized Route Card */}
              <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-md hover:shadow-lg transition-shadow relative overflow-visible">
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2 text-emerald-800">
                      AI Optimized Route
                    </h3>
                    <p className="text-emerald-600/80 text-sm font-medium">Safest Route</p>
                  </div>
                  <div className="text-right mr-10">
                    <div className="flex items-center gap-1 font-bold text-xl text-slate-800">
                      <Clock size={20} className="text-slate-400" />
                      45 mins
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-100 flex items-start gap-3 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                  <ShieldCheck size={20} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold">Health Protected</p>
                    <p className="text-xs mt-1 text-emerald-600">Bypasses major industrial and traffic hotspots. 40% less exposure to PM2.5 compared to standard route.</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
