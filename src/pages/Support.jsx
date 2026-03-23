import React from 'react';
import { Mail, Info } from 'lucide-react';

export default function Support() {
  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center justify-center bg-slate-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-2">
          PolluAware AI
        </h1>
        <p className="italic text-slate-500 text-lg">
          A Product by Team Vikings
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-2xl text-center">
        <div className="mb-8">
          <a
            href="mailto:support@polluawareai.com"
            className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors bg-blue-50 px-6 py-3 rounded-full hover:bg-blue-100"
          >
            <Mail size={24} />
            Support Mail ID: support@polluawareai.com
          </a>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 text-slate-600 leading-relaxed">
          <Info size={32} className="text-slate-400 mb-2" />
          <p className="text-base text-justify md:text-center text-[#334155]">
            PolluAware AI is a real-time pollution intelligence platform uniting citizens and authorities. It features live AQI hotspot mapping, AI-driven safe route optimization to avoid pollution, and a direct citizen-to-government complaint system. It empowers users to make safer daily choices while enabling data-driven environmental policies.
          </p>
        </div>
      </div>
    </div>
  );
}
