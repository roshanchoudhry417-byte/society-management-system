import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, X, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BookingsView = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amenity: 'clubhouse',
    date: '',
    timeSlot: '10:00-12:00',
    notes: ''
  });

  const amenities = ['gym', 'clubhouse', 'swimming-pool', 'party-hall', 'tennis-court', 'garden'];
  const timeSlots = [
    '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00',
    '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00',
  ];

  const fetchBookings = async () => {
    try {
      const isAdminOrSecretary = user?.role === 'admin' || user?.role === 'secretary';
      const res = await api.get(isAdminOrSecretary ? '/bookings' : '/bookings/my');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/bookings', formData);
      setIsModalOpen(false);
      setFormData({ amenity: 'clubhouse', date: '', timeSlot: '10:00-12:00', notes: '' });
      fetchBookings();
    } catch (err) {
      console.error("Failed to create booking", err);
      alert(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      console.error("Failed to cancel booking", err);
      alert('Failed to cancel booking');
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
            <Calendar className="w-8 h-8 text-brand-accent" />
            Amenity <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Bookings</span>
          </h1>
          <p className="text-app-subtext">Reserve society facilities for your personal use</p>
        </div>
        
        {user?.role !== 'secretary' && (
          <button onClick={() => setIsModalOpen(true)} className="pill-button pill-button-navy px-6 py-3 flex items-center gap-2 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>New Booking</span>
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
        ) : bookings.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass-panel">
            <CheckCircle2 className="w-16 h-16 text-brand-success/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
            <p className="text-app-subtext max-w-sm">You haven't made any reservations. Book an amenity to get started.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <motion.div key={booking._id} variants={itemVars} className="card-navy p-6 flex flex-col group hover:border-brand-accent/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border text-brand-accent bg-brand-accent/10 border-brand-accent/30">
                  {booking.status}
                </div>
                <button onClick={() => handleCancel(booking._id)} className="text-xs text-red-400 hover:text-red-300">Cancel</button>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 capitalize flex items-center gap-2">
                <MapPin className="w-4 h-4 text-app-subtext" /> {booking.amenity.replace('-', ' ')}
              </h3>
              <p className="text-sm text-app-subtext flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" /> {new Date(booking.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-app-subtext flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" /> {booking.timeSlot}
              </p>
              
              {booking.notes && <p className="text-xs text-white/50 italic mt-auto pt-4 border-t border-white/10">"{booking.notes}"</p>}
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
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Reserve Amenity</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Amenity</label>
                  <select name="amenity" value={formData.amenity} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none capitalize">
                    {amenities.map(a => <option key={a} value={a}>{a.replace('-', ' ')}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Time Slot</label>
                    <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none">
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Notes (Optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors resize-none h-20" placeholder="Any special requests?" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-brand-accent to-purple-600 text-white font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                  {submitting ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
