import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  LayoutDashboard, 
  FileText, 
  ScanSearch, 
  Users, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Laporan Sampah', path: '/reports', icon: FileText },
    { label: 'AI Scanner', path: '/scan', icon: ScanSearch },
    ...(isAdmin ? [{ label: 'Manajemen Pengguna', path: '/users', icon: Users }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Section: Logo & Desktop Navigation */}
        <div className="flex items-center gap-6">
          {/* Brand Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:bg-emerald-700 transition">
              <Recycle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-0.5">
                Smart<span className="text-emerald-600">Waste</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block -mt-1">
                Management System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Icons */}
          <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: User Profile & Logout (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3 pl-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight max-w-[140px] truncate">
                  {user.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                      <UserIcon className="w-3 h-3 text-blue-600" />
                      Citizen
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar (Logout)"
                className="ml-2 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-1.5 animate-in fade-in slide-in-from-top-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}

          {user && (
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
