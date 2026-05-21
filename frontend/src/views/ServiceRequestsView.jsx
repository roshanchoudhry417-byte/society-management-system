import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Wrench, Plus, X, Calendar, Phone, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ServiceRequestsView = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'plumbing',
    description: '',
    scheduledDate: ''
  });

  const serviceTypes = ['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'pest-control', 'other'];

  const fetchRequests = async () => {
    try {
      const res = await api.get('/service-requests');
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch service requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/service-requests', formData);
      setIsModalOpen(false);
      setFormData({ type: 'plumbing', description: '', scheduledDate: '' });
      fetchRequests();
    } catch (err) {
      console.error("Failed to create request", err);
      alert(err.response?.data?.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id, currentStatus) => {
    if (currentStatus === 'completed') return;
    try {
      const newStatus = currentStatus === 'pending' ? 'in-progress' : 'completed';
      await api.put(`/service-requests/${id}`, { status: newStatus });
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status", err);
      alert('Failed to update status');
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
            <Wrench className="w-8 h-8 text-brand-accent" />
            Service <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Requests</span>
          </h1>
          <p className="text-app-subtext">Request plumbing, electrical, or other maintenance services</p>
        </div>
        
        {user?.role !== 'secretary' && (
          <button onClick={() => setIsModalOpen(true)} className="pill-button pill-button-navy px-6 py-3 flex items-center gap-2 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>New Request</span>
          </button>
        )}
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="card-navy p-6 animate-pulse border border-white/5">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
              <div className="h-4 bg-white/5 rounded w-5/6"></div>
            </div>
          ))
        ) : requests.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass-panel">
            <CheckCircle2 className="w-16 h-16 text-brand-success/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All Set!</h3>
            <p className="text-app-subtext max-w-sm">You have no active service requests.</p>
          </div>
        ) : (
          requests.map((req) => (
            <motion.div key={req._id} variants={itemVars} className="card-navy p-6 flex flex-col group hover:border-brand-accent/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    req.status === 'completed' ? 'text-brand-success bg-brand-success/10 border-brand-success/30' : 
                    req.status === 'in-progress' ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' : 
                    'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                  }`}>
                    {req.status}
                  </div>
                  {(user?.role === 'admin' || user?.role === 'secretary') && req.status !== 'completed' && (
                    <button 
                      onClick={() => handleApprove(req._id, req.status)}
                      className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/40 transition-colors"
                    >
                      {req.status === 'pending' ? 'Start' : 'Complete'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-app-subtext">
                  <Clock className="w-3 h-3" />
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 capitalize flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-accent" /> {req.type.replace('-', ' ')}
              </h3>
              <p className="text-sm text-app-subtext mb-6 flex-1">{req.description}</p>
              
              {(req.assignedVendor || req.scheduledDate) && (
                <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
                  {req.scheduledDate && (
                    <p className="text-xs text-white/70 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-brand-accent" />
                      Scheduled for: {new Date(req.scheduledDate).toLocaleDateString()}
                    </p>
                  )}
                  {req.assignedVendor && (
                    <p className="text-xs text-white/70 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-brand-success" />
                      Assigned: {req.assignedVendor} {req.vendorPhone && `(${req.vendorPhone})`}
                    </p>
                  )}
                </div>
              )}
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
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Request Service</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Service Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none capitalize">
                      {serviceTypes.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Preferred Date</label>
                    <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors resize-none h-24" placeholder="Describe what needs to be fixed..." />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-brand-accent to-purple-600 text-white font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
