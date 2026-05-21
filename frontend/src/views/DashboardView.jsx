import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Play, Pause, Clock, CheckCircle2, ChevronRight, User, MessageSquare, Activity, ShieldCheck, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Real data state
  const [stats, setStats] = useState({ residents: 0, complaints: 0, visitors: 0 });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, complaintsRes, visitorsRes] = await Promise.all([
          (user?.role === 'admin' || user?.role === 'secretary')
            ? api.get('/users').catch(() => ({ data: { data: [] } })) 
            : Promise.resolve({ data: { data: [] } }),
          api.get('/complaints'),
          api.get('/visitors')
        ]);

        const usersList = usersRes.data.data || [];
        const complaintsList = complaintsRes.data.data || [];
        const visitorsList = visitorsRes.data.data || [];

        setStats({
          residents: usersList.length > 0 ? usersList.length : ((user?.role === 'admin' || user?.role === 'secretary') ? 0 : 124),
          complaints: complaintsList.filter(c => c.status !== 'resolved').length,
          visitors: visitorsList.length
        });

        setComplaints(complaintsList.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="glass-panel p-12 max-w-md w-full animate-float">
          <ShieldCheck className="w-16 h-16 text-brand-accent mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Secure Access Required</h2>
          <p className="text-app-subtext mb-8">Please authenticate to view your personalized society dashboard.</p>
          <a href="/auth" className="pill-button pill-button-navy px-8 py-3 w-full">
            Proceed to Login
          </a>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      
      {/* Header Row */}
      <motion.div variants={itemVars} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight flex items-center gap-3">
            Welcome, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">{user.name.split(' ')[0]}</span>
          </h1>
          
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/5 border border-white/10 text-white text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
              <Home className="w-3 h-3 text-brand-accent" />
              <span>Flat {user.flatNumber || 'N/A'}</span>
            </div>
            <div className="bg-brand-accent/20 border border-brand-accent/30 text-brand-accent text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
              <ShieldCheck className="w-3 h-3" />
              <span className="capitalize">{user.role}</span>
            </div>
            <div className="bg-brand-success/20 border border-brand-success/30 text-brand-success text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
              <Activity className="w-3 h-3" />
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* Large Right Stats */}
        <div className="flex gap-8 lg:gap-12 pl-4 border-l-2 border-white/10">
          <div className="text-center group">
            <div className="flex items-center justify-center gap-2 text-white mb-1 transition-transform group-hover:scale-105">
              <User className="w-5 h-5 text-app-subtext group-hover:text-brand-accent transition-colors" />
              <span className="text-4xl md:text-5xl font-light">{stats.residents}</span>
            </div>
            <p className="text-[10px] text-app-subtext font-semibold uppercase tracking-[0.2em]">Residents</p>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center gap-2 text-white mb-1 transition-transform group-hover:scale-105">
              <Clock className="w-5 h-5 text-brand-accent" />
              <span className="text-4xl md:text-5xl font-light">{stats.complaints}</span>
            </div>
            <p className="text-[10px] text-app-subtext font-semibold uppercase tracking-[0.2em]">Active Issues</p>
          </div>
          <div className="text-center group">
            <div className="flex items-center justify-center gap-2 text-white mb-1 transition-transform group-hover:scale-105">
              <CheckCircle2 className="w-5 h-5 text-brand-success" />
              <span className="text-4xl md:text-5xl font-light">{stats.visitors}</span>
            </div>
            <p className="text-[10px] text-app-subtext font-semibold uppercase tracking-[0.2em]">Visitors</p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid (Bento Box Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Profile Card (Left) */}
        <motion.div variants={itemVars} className="lg:col-span-3 lg:row-span-2 glass-panel overflow-hidden relative flex flex-col group">
          <div className="h-32 bg-gradient-to-br from-brand-accent/20 to-purple-600/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(139,92,246,0.3)_0%,_transparent_60%)]"></div>
          </div>
          <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col">
            <div className="w-20 h-20 rounded-2xl border border-white/20 bg-app-card text-white text-3xl flex items-center justify-center font-bold uppercase shadow-glow absolute -top-10 backdrop-blur-xl group-hover:scale-105 transition-transform">
              {user.name.charAt(0)}
            </div>
            <div className="mt-14">
              <h3 className="text-xl font-bold text-white tracking-tight">{user.name}</h3>
              <p className="text-sm text-app-subtext capitalize">{user.role} • Flat {user.flatNumber || 'Admin'}</p>
            </div>
            <div className="mt-auto pt-6">
              <div className="flex justify-between items-center bg-black/40 rounded-2xl p-4 border border-white/5">
                <span className="text-xs font-semibold text-app-subtext uppercase tracking-wider">Monthly Dues</span>
                <span className="text-lg font-bold text-brand-accent">$1,500</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Traffic Chart (Center Top) */}
        <motion.div variants={itemVars} className="lg:col-span-6 glass-panel p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-accent" />
                Traffic Overview
              </h3>
              <p className="text-xs text-app-subtext mt-1">Visitor flow this week</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-app-subtext hover:bg-white/10 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4 -rotate-45" />
            </button>
          </div>
          <div className="flex items-end justify-between h-32 gap-3 mt-auto px-2">
            {[40, 60, 30, 80, 50, 90, 40].map((h, i) => (
              <div key={i} className="w-full bg-white/5 rounded-t-lg h-full relative flex items-end group-hover:bg-white/10 transition-colors">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className={`w-full rounded-t-lg ${i === 5 ? 'bg-gradient-to-t from-brand-accent/50 to-brand-accent shadow-glow' : 'bg-white/20'}`} 
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-app-subtext font-medium px-4">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span className="text-white">F</span><span>S</span>
          </div>
        </motion.div>

        {/* Resolution Rate (Right Top) */}
        <motion.div variants={itemVars} className="lg:col-span-3 glass-panel p-6 flex flex-col items-center justify-center relative group">
           <div className="absolute top-4 right-4">
             <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-app-subtext hover:text-white hover:bg-white/10 transition-colors">
               <ChevronRight className="w-4 h-4 -rotate-45" />
             </button>
           </div>
           <h3 className="text-sm font-bold text-white mb-1 self-start w-full tracking-tight">Resolution Rate</h3>
           <div className="relative w-32 h-32 mt-4 mb-6 group-hover:scale-105 transition-transform">
             <svg className="w-full h-full transform -rotate-90 drop-shadow-glow">
               <circle cx="64" cy="64" r="56" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
               <motion.circle 
                  cx="64" cy="64" r="56" fill="transparent" stroke="#8b5cf6" strokeWidth="12" 
                  strokeDasharray="351.85" 
                  initial={{ strokeDashoffset: 351.85 }}
                  animate={{ strokeDashoffset: 351.85 * (1 - 0.85) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round" 
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-3xl font-light text-white">85%</span>
               <span className="text-[9px] text-brand-accent uppercase tracking-widest font-semibold mt-1">Resolved</span>
             </div>
           </div>
           <div className="flex gap-3 w-full justify-center">
             <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 hover:shadow-glow transition-all"><Play className="w-4 h-4 ml-1" /></button>
             <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all"><Pause className="w-4 h-4" /></button>
           </div>
        </motion.div>

        {/* Quick Links (Left Bottom) */}
        <motion.div variants={itemVars} className="lg:col-span-3 glass-panel p-6">
          <h4 className="font-bold text-white mb-5 tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-success" />
            Quick Actions
          </h4>
          <div className="space-y-3">
            {[
              { name: 'Maintenance Details', path: '/maintenance' },
              { name: 'Visitor Pass', path: '/visitors' },
              { name: 'Vehicle Registration', path: '/vehicles' },
              { name: 'Society Bylaws', path: '/bylaws' }
            ].map((item, i) => (
              <div key={i} onClick={() => navigate(item.path)} className="flex justify-between items-center group cursor-pointer p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                <span className="text-sm text-app-subtext group-hover:text-white font-medium transition-colors">{item.name}</span>
                <ChevronRight className="w-4 h-4 text-app-subtext group-hover:text-brand-accent transition-colors group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tasks/Complaints List (Center & Right Bottom) */}
        <motion.div variants={itemVars} className="lg:col-span-6 card-navy p-6 min-h-[300px] flex flex-col relative overflow-hidden group">
          {/* Abstract glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-brand-accent/20 transition-colors duration-700"></div>
          
          <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recent Complaints</h3>
              <p className="text-xs text-app-subtext mt-1">Needs attention</p>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
              <span className="text-sm font-semibold text-white">{complaints.length} <span className="text-white/50">/ {stats.complaints}</span></span>
            </div>
          </div>
          
          <div className="space-y-3 flex-1 relative z-10">
            {loading ? (
               <div className="animate-pulse flex flex-col gap-3">
                 {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl border border-white/5"></div>)}
               </div>
            ) : complaints.length === 0 ? (
               <div className="text-sm text-app-subtext text-center mt-12 flex flex-col items-center">
                 <CheckCircle2 className="w-12 h-12 text-brand-success/50 mb-3" />
                 All clear! No active complaints.
               </div>
            ) : (
              complaints.map((comp, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={comp._id} 
                  className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 hover:bg-white/10 transition-all cursor-pointer border border-white/5 hover:border-white/20 hover:shadow-glow group/item"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent/20 to-purple-600/20 border border-brand-accent/30 flex items-center justify-center shadow-inner">
                     <MessageSquare className="w-4 h-4 text-brand-accent group-hover/item:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{comp.title}</p>
                    <p className="text-[11px] text-app-subtext capitalize mt-0.5 font-medium tracking-wide">
                      {comp.status} • {new Date(comp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md ${comp.status === 'resolved' ? 'bg-brand-success/20 border-brand-success/50 text-brand-success border' : 'bg-white/5 border border-white/10 text-app-subtext'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <button onClick={() => navigate('/complaints')} className="w-full py-3 mt-6 rounded-xl border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all tracking-wider uppercase relative z-10 hover:border-white/30">
            View All Complaints
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
};

