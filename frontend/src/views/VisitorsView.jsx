import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users, Plus, X, Phone, Car, Clock, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VisitorsView = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    flatNumber: user.flatNumber || '',
    phone: '',
    purpose: '',
    type: 'guest',
    vehicleNumber: ''
  });

  const visitorTypes = ['guest', 'delivery', 'cab', 'service', 'other'];

  const fetchVisitors = async () => {
    try {
      const res = await api.get('/visitors');
      setVisitors(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch visitors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/visitors', formData);
      setIsModalOpen(false);
      setFormData({ name: '', flatNumber: user.flatNumber || '', phone: '', purpose: '', type: 'guest', vehicleNumber: '' });
      fetchVisitors();
    } catch (err) {
      console.error("Failed to create visitor pass", err);
      alert(err.response?.data?.message || 'Failed to create visitor pass');
    } finally {
      setSubmitting(false);
    }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6 relative min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-accent" />
            Visitor <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Passes</span>
          </h1>
          <p className="text-app-subtext">Pre-approve guests and deliveries for hassle-free entry</p>
        </div>
        
        {user?.role !== 'secretary' && (
          <button onClick={() => setIsModalOpen(true)} className="pill-button pill-button-navy px-6 py-3 flex items-center gap-2 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>New Visitor Pass</span>
          </button>
        )}
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="card-navy p-6 animate-pulse border border-white/5">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
            </div>
          ))
        ) : visitors.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass-panel">
            <Users className="w-16 h-16 text-brand-accent/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Visitors Expected</h3>
            <p className="text-app-subtext max-w-sm">Create a pass to pre-approve your upcoming guests.</p>
          </div>
        ) : (
          visitors.map((visitor) => (
            <motion.div key={visitor._id} variants={itemVars} className="card-navy p-6 flex flex-col group hover:border-brand-accent/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  visitor.status === 'entered' ? 'text-brand-success bg-brand-success/10 border-brand-success/30' : 
                  visitor.status === 'exited' ? 'text-app-subtext bg-white/5 border-white/10' : 
                  'text-brand-accent bg-brand-accent/10 border-brand-accent/30'
                }`}>
                  {visitor.status || 'Expected'}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-app-subtext">
                  <Clock className="w-3 h-3" />
                  {new Date(visitor.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{visitor.name}</h3>
              <p className="text-xs text-brand-accent uppercase tracking-wider font-semibold mb-4">{visitor.type}</p>
              
              <div className="space-y-2 mt-auto">
                {visitor.phone && (
                  <p className="text-sm text-app-subtext flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/50" /> {visitor.phone}
                  </p>
                )}
                {visitor.vehicleNumber && (
                  <p className="text-sm text-app-subtext flex items-center gap-2">
                    <Car className="w-4 h-4 text-white/50" /> {visitor.vehicleNumber}
                  </p>
                )}
                {visitor.purpose && (
                  <p className="text-sm text-app-subtext flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white/50" /> {visitor.purpose}
                  </p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass-panel p-8 border border-white/20 shadow-2xl">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-app-subtext hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Generate Visitor Pass</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Visitor Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Visitor Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none capitalize">
                      {visitorTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Phone (Optional)</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Vehicle # (Optional)</label>
                    <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Purpose of Visit</label>
                  <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-brand-accent to-purple-600 text-white font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                  {submitting ? 'Submitting...' : 'Generate Pass'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
