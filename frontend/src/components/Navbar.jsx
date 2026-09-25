import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { PlusCircle, Map, LogOut, Home, Star } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/citizen', label: t('dashboard', 'Dashboard'), icon: Home },
    { to: '/my-problems', label: t('my_problems', 'My Problems'), icon: Star },
    { to: '/submit', label: t('submit_problem', 'Submit Problem'), icon: PlusCircle },
    { to: '/map', label: t('map_view', 'Map View'), icon: Map },
  ];

  return (
    <nav className="bg-gradient-to-r from-primary via-indigo-800 to-primary text-white shadow-lg border-b border-indigo-900/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo - Left */}
        <Link
          to="/"
          className="flex items-center bg-white px-2 py-1 rounded-lg shrink-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <img
            src="/logo.jpg"
            alt="YUKTI"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links - Center */}
        <div className="flex-1 flex justify-center items-center space-x-2 sm:space-x-4 text-sm font-medium">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-white/15 text-accent shadow-inner'
                    : 'hover:bg-white/10 hover:text-accent text-white/90'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute -bottom-[17px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Section: Language Selector + User Info / Logout */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSelector />

          {user && (
            <div className="flex items-center space-x-4 pl-3 border-l border-indigo-700/60">
              <div className="text-xs text-right hidden sm:block">
                <p className="font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-accent uppercase tracking-wider text-[10px] font-medium">
                  {user.role}
                </p>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center space-x-2 bg-indigo-900/50 hover:bg-red-500/80 px-3 py-2 rounded-lg text-subText hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout', 'Logout')}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}