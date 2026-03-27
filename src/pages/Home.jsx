import React from 'react';
import { Leaf, Map, BrainCircuit, ShieldAlert, Activity } from 'lucide-react';
import RoleSelection from './auth/RoleSelection';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0B1120] text-slate-50 font-sans selection:bg-emerald-500/30 overflow-x-hidden flex flex-col justify-between">

      {/* 1. Global Styling & Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.10] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col pt-12">

        {/* 2. The Header (Top Center) */}
        <header className="flex flex-col items-center justify-center text-center px-4 mb-10 w-full animate-in fade-in slide-in-from-top-4 duration-1000">
          {/* Logo & Name */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-500 shadow-xl shadow-emerald-500/20">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white">
              Pollu<span className="text-emerald-400">Aware</span> AI
            </span>
          </div>

          {/* Tagline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-200">
              Breathe Easier.
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              Govern Smarter.
            </span>
          </h1>
        </header>

        {/* 3. Main Stage (The 3-Column Center) */}
        <main className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-8 w-full max-w-[1500px] mx-auto px-4 pb-20">

          {/* Left Flank (Desktop Only > xl) */}
          <div className="hidden xl:flex flex-col gap-6 w-[340px] animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-5 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                <Map className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white tracking-wide">Live Geo-Fencing</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">Real-time tracking of pollution hotspots with instant alerts and protective routing.</p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:-translate-y-1 hover:border-indigo-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-5 border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                <BrainCircuit className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white tracking-wide">AI Policy Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">Predictive modeling generates actionable interventions and environmental suggestions.</p>
            </div>
          </div>

          {/* Absolute Center (RoleSelection Gateway) */}
          <div className="w-full max-w-2xl xl:max-w-xl shrink-0 flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000 z-20">
            {/* The pulsing multi-color drop shadow container */}
            <div className="relative rounded-[2.5rem] p-1 w-full mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 rounded-[2.5rem] blur-xl animate-pulse opacity-40"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 rounded-[2.5rem] opacity-80 border border-white/20"></div>

              <div className="relative bg-slate-50 rounded-[2.4rem] overflow-hidden w-full shadow-2xl [&>div]:!min-h-[550px] [&>div]:!bg-transparent sm:[&>div]:!p-8 scale-[0.98] transition-transform">
                <RoleSelection />
              </div>
            </div>
          </div>

          {/* Right Flank (Desktop Only > xl) */}
          <div className="hidden xl:flex flex-col gap-6 w-[340px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:-translate-y-1 hover:border-sky-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-5 border border-sky-500/20 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all">
                <ShieldAlert className="w-7 h-7 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white tracking-wide">Closed-Loop Grievance</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">Direct citizen reporting with transparent, tamper-proof authority audit trails.</p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-5 border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                <Activity className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white tracking-wide">Unified Dashboard</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">High-level telemetry monitoring combining citizen data with sensor analytics.</p>
            </div>
          </div>

          {/* Mobile Behavior: Simplified Feature List (< xl) */}
          <div className="xl:hidden w-full max-w-2xl mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 px-2 animate-in fade-in duration-1000 delay-500 relative z-20">
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="p-2 bg-emerald-500/20 rounded-xl"><Map className="w-5 h-5 text-emerald-400 shrink-0" /></div>
              <p className="text-sm font-medium text-slate-200">Live Geo-Fencing</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="p-2 bg-indigo-500/20 rounded-xl"><BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0" /></div>
              <p className="text-sm font-medium text-slate-200">AI Policy Engine</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="p-2 bg-sky-500/20 rounded-xl"><ShieldAlert className="w-5 h-5 text-sky-400 shrink-0" /></div>
              <p className="text-sm font-medium text-slate-200">Secure Grievance</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="p-2 bg-purple-500/20 rounded-xl"><Activity className="w-5 h-5 text-purple-400 shrink-0" /></div>
              <p className="text-sm font-medium text-slate-200">Unified Dashboard</p>
            </div>
          </div>

        </main>
      </div>

      {/* 4. The Footer (Bottom Center) */}
      <footer className="relative z-30 w-full py-6 px-4 bg-slate-900/40 backdrop-blur-xl border-t border-white/5 flex flex-col items-center justify-center text-center">
        <p className="text-slate-400 font-medium font-mono text-xs sm:text-sm tracking-wide">
          Built with <span className="text-sky-400 animate-pulse inline-block mx-1 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">⚔️</span> by Team Vikings | Code Pirates for Social Good
        </p>
      </footer>

    </div>
  );
}
