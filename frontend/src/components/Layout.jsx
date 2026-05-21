import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Notices', path: '/notices' },
    { name: 'Payments', path: '/payments' },
    { name: 'Polls', path: '/polls' },
    { name: 'Services', path: '/service-requests' },
    { name: 'Complaints', path: '/complaints' },
    { name: 'Visitors', path: '/visitors' },
  ];

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-4 md:p-8 flex flex-col font-sans relative overflow-hidden">
      
      {/* Abstract Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-accent/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-success/10 blur-[120px] pointer-events-none"></div>

      {/* Top Floating Navigation Bar */}
      <header className="sticky top-4 z-50 flex justify-between items-center mb-10 glass-panel px-6 py-4 mx-auto w-full max-w-[1400px]">
        
        {/* Logo */}
        <div className="text-2xl font-light text-white tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-accent to-purple-400 flex items-center justify-center shadow-glow">
            <span className="font-bold text-lg text-white">S</span>
          </div>
          Society<span className="font-bold">Hub</span>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-full backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-app-subtext hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-app-subtext hover:text-white hover:bg-white/10 transition-all">
            <Bell className="w-5 h-5" />
          </button>
          
          {user ? (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <button 
                onClick={() => logout()}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
              <div className="flex items-center gap-3 bg-white/5 pr-4 pl-1 py-1 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white font-medium uppercase shadow-glow text-sm">
                  {user?.name?.charAt(0) || ''}
                </div>
                <span className="text-sm font-medium text-white hidden sm:block">{user?.name?.split(' ')[0] || ''}</span>
              </div>
            </div>
          ) : (
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-app-subtext hover:text-white transition-all">
              <User className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
};
