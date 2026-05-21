import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Bell, Megaphone, FileText, Calendar, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NoticesView = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch notices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/notices', {
        title,
        description,
        category,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days default
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setCategory('general');
      fetchNotices();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create notice');
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

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'emergency': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'maintenance': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'event': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'meeting': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      default: return 'text-brand-accent bg-brand-accent/10 border-brand-accent/30';
    }
  };

  return (
    <div className="space-y-6 relative min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-brand-accent" />
            Society <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Notices</span>
          </h1>
          <p className="text-app-subtext">Important announcements and updates from the administration</p>
        </div>

        {(user?.role === 'secretary' || user?.role === 'admin') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="pill-button pill-button-navy px-6 py-3 flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-4xl space-y-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="card-navy p-6 animate-pulse border border-white/5">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
              <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
            </div>
          ))
        ) : notices.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center glass-panel">
            <Bell className="w-16 h-16 text-brand-accent/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Notices</h3>
            <p className="text-app-subtext max-w-sm">There are no active announcements at the moment.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <motion.div key={notice._id} variants={itemVars} className="card-navy p-6 flex gap-6 group hover:border-brand-accent/30 transition-colors">
              <div className="hidden sm:flex flex-col items-center justify-start pt-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent/20 to-purple-600/20 border border-brand-accent/30 flex items-center justify-center shadow-inner">
                  <FileText className="w-5 h-5 text-brand-accent" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-accent transition-colors flex items-center gap-3">
                      {notice.title}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getCategoryColor(notice.category)}`}>
                        {notice.category}
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-app-subtext bg-white/5 px-3 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-app-subtext whitespace-pre-line leading-relaxed">{notice.description || notice.content}</p>
                {notice.category === 'emergency' && (
                   <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 border border-red-400/30">
                     Urgent Notice
                   </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create Notice Modal */}
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
              
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Post Society Notice</h2>
              
              <form onSubmit={handleCreateNotice} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors cursor-pointer"
                  >
                    <option value="general" className="bg-app-bg text-white">General Notice</option>
                    <option value="maintenance" className="bg-app-bg text-white">Maintenance Update</option>
                    <option value="event" className="bg-app-bg text-white">Event Announcement</option>
                    <option value="emergency" className="bg-app-bg text-white">Emergency Notice</option>
                    <option value="meeting" className="bg-app-bg text-white">Society Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="Enter notice title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Description / Details</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors resize-none"
                    placeholder="Provide details about the notice..."
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-brand-accent to-purple-600 text-white font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                >
                  {submitting ? 'Posting...' : 'Post Notice'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
