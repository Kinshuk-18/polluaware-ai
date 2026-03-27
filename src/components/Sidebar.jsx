import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import {
  LayoutDashboard,
  MapPin,
  MessageSquareWarning,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  HelpCircle,
  List,
  Sparkles,
  PieChart,
  Radio,
  User
} from 'lucide-react';

export default function Sidebar() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const baseItems = userRole === 'citizen' ? [
    { label: 'Dashboard', path: '/citizen-dashboard', icon: LayoutDashboard },
    { label: 'Smart Route AI', path: '/smart-route', icon: MapPin },
    { label: 'Raise Complaint', path: '/complaints', icon: MessageSquareWarning },
  ] : userRole === 'govt' ? [
    { label: 'Dashboard', path: '/govt-dashboard', icon: ShieldCheck },
    { label: 'Emergency Alerts', path: '/govt-broadcasts', icon: Radio },
    { label: 'Source Analysis', path: '/govt-source-id', icon: PieChart },
    { label: 'Hotspot List', path: '/govt-hotspots', icon: MapPin },
    { label: 'AI Suggestions', path: '/govt-ai-suggestions', icon: Sparkles },
    { label: 'Citizen Complaints', path: '/manage-complaints', icon: List },
  ] : [];

  const navItems = userRole === 'citizen'
    ? [...baseItems, { label: 'Profile', path: '/profile', icon: User }, { label: 'Support', path: '/support', icon: HelpCircle }]
    : [...baseItems, { label: 'Support', path: '/support', icon: HelpCircle }];

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-slate-900 text-white z-50 px-4 py-3 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">PolluAware AI</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-slate-300">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar Content */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen
      `}>
        <div className="px-6 py-8 hidden md:block">
          <h1 className="text-2xl font-bold text-white tracking-wide">PolluAware AI</h1>
          <p className="text-slate-400 text-sm mt-1">{userRole === 'govt' ? 'Admin Portal' : 'Citizen Portal'}</p>
        </div>

        {/* Separator for mobile */}
        <div className="h-16 md:hidden"></div>

        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all font-medium group"
          >
            <LogOut size={20} className="group-hover:text-red-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
