import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto w-full pt-16 md:pt-0">
        <main className="min-h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
