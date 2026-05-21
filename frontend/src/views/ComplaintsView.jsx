import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, X, MessageSquare, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ComplaintsView = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'maintenance'
  });

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/complaints', formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', priority: 'medium', category: 'maintenance' });
      fetchComplaints(); // Refresh list
    } catch (err) {
      console.error("Failed to create complaint", err);
      alert(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id, currentStatus) => {
    if (currentStatus === 'resolved') return;
    try {
      const newStatus = currentStatus === 'pending' ? 'in-progress' : 'resolved';
      await api.put(`/complaints/${id}`, { status: newStatus });
      fetchComplaints();
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

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      default: return 'text-green-400 bg-green-400/10 border-green-400/30';
    }
  };

  return (
    <div className="space-y-6 relative min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-brand-accent" />
            Complaints <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Registry</span>
          </h1>
          <p className="text-app-subtext">Manage and track society issues</p>
        </div>
        
        {user?.role !== 'secretary' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="pill-button pill-button-navy px-6 py-3 flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>New Complaint</span>
          </button>
        )}
      </div>

      {/* Complaints List */}
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="card-navy p-6 animate-pulse border border-white/5">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
              <div className="h-4 bg-white/5 rounded w-5/6"></div>
            </div>
          ))
        ) : complaints.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass-panel">
            <CheckCircle2 className="w-16 h-16 text-brand-success/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
            <p className="text-app-subtext max-w-sm">There are currently no active complaints in the system. Everything is running smoothly.</p>
          </div>
        ) : (
          complaints.map((comp) => (
            <motion.div key={comp._id} variants={itemVars} className="card-navy p-6 flex flex-col group hover:border-brand-accent/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(comp.priority)}`}>
                  {comp.priority}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-app-subtext">
                  <Clock className="w-3 h-3" />
                  {new Date(comp.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{comp.title}</h3>
              <p className="text-sm text-app-subtext mb-6 line-clamp-3 flex-1">{comp.description}</p>
              
              <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-white/50 capitalize flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {comp.category}
                </span>
                <div className="flex items-center gap-2">
                  {(user?.role === 'admin' || user?.role === 'secretary') && comp.status !== 'resolved' && (
                    <button 
                      onClick={() => handleApprove(comp._id, comp.status)}
                      className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/40 transition-colors"
                    >
                      {comp.status === 'pending' ? 'Start' : 'Resolve'}
                    </button>
                  )}
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    comp.status === 'resolved' ? 'bg-brand-success/20 text-brand-success' : 
                    comp.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-white/10 text-white'
                  }`}>
                    {comp.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* New Complaint Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-8 border border-white/20 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-app-subtext hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">File a Complaint</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="Brief summary of the issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors resize-none h-32"
                    placeholder="Provide details about the issue..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                    >
                      <option value="maintenance">Maintenance</option>
                      <option value="noise">Noise</option>
                      <option value="parking">Parking</option>
                      <option value="security">Security</option>
                      <option value="cleanliness">Cleanliness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-brand-accent to-purple-600 text-white font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
