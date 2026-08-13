import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Truck, Search, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onSearchTracking: (trackingNumber: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchTracking }) => {
  const [searchInput, setSearchInput] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchTracking(searchInput.trim());
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-wide">Deli<span className="text-emerald-400">Track</span></span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-widest uppercase">Ethiopian Delivery Platform</span>
            </div>
          </Link>

          {/* Quick Tracking Search Bar */}
          {isAuthenticated && (
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-xs w-full ml-8 mr-auto">
              <input
                type="text"
                placeholder="Track Order # (e.g. ORD-1024)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-800/90 text-slate-100 text-sm pl-9 pr-4 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder-slate-400 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            </form>
          )}

          {/* User Auth Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <div className="hidden sm:flex items-center space-x-3 bg-slate-800/50 py-1.5 px-3 rounded-xl border border-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight">{user.fullName}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
