import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome to PolluAware AI</h1>
        <p className="text-lg text-slate-600 max-w-lg mx-auto">
          A real-time pollution monitoring and decision-support platform for citizens and authorities.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Citizen Card */}
        <div 
          onClick={() => navigate('/auth/citizen')}
          className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">I am a Citizen</h2>
          <p className="text-slate-500">
            Monitor real-time AQI, find safe routes, and report pollution in your area.
          </p>
        </div>

        {/* Admin Card */}
         <div 
          onClick={() => navigate('/auth/admin')}
          className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-800 transition-all cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="h-20 w-20 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Government Admin</h2>
          <p className="text-slate-500">
            Access policy dashboards, manage citizen complaints, and monitor city-wide trends.
          </p>
        </div>
      </div>
    </div>
  );
}
