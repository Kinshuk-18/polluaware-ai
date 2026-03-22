import React from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function CitizenDashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-4">
            Welcome to the Citizen Panel
          </h1>
          <p className="text-lg text-gray-600">
            Hello, {currentUser?.email}
          </p>
        </div>
      </main>
    </div>
  );
}
