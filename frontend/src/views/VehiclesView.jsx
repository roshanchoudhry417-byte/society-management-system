import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Car, Plus, X, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VehiclesView = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState(user?.vehicles || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'car',
    registrationNumber: '',
    makeAndModel: '',
    color: ''
  });

  const fetchVehicles = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'secretary') {
        const res = await api.get('/users');
        const allUsers = res.data.data || [];
        const allVehicles = allUsers.reduce((acc, curr) => {
           if (curr.vehicles && curr.vehicles.length > 0) {
              const userVehicles = curr.vehicles.map(v => ({ ...v, ownerName: curr.name, flatNumber: curr.flatNumber }));
              return [...acc, ...userVehicles];
           }
           return acc;
        }, []);
        setVehicles(allVehicles);
      } else {
        const res = await api.get('/auth/me');
        setVehicles(res.data.data.user.vehicles || []);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/me/vehicles', formData);
      setIsModalOpen(false);
      setFormData({ type: 'car', registrationNumber: '', makeAndModel: '', color: '' });
      fetchVehicles();
    } catch (err) {
      console.error("Failed to add vehicle", err);
      alert(err.response?.data?.message || 'Failed to add vehicle');
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
            <Car className="w-8 h-8 text-brand-accent" />
            Vehicle <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Registry</span>
          </h1>
          <p className="text-app-subtext">Register and manage vehicles for your household</p>
        </div>
        
        {user?.role !== 'secretary' && (
          <button onClick={() => setIsModalOpen(true)} className="pill-button pill-button-navy px-6 py-3 flex items-center gap-2 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass-panel">
            <Car className="w-16 h-16 text-brand-accent/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Vehicles Registered</h3>
            <p className="text-app-subtext max-w-sm">You haven't added any vehicles to your profile yet.</p>
          </div>
        ) : (
          vehicles.map((vehicle, idx) => (
            <motion.div key={idx} variants={itemVars} className="card-navy p-6 flex flex-col group hover:border-brand-accent/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-wider">{vehicle.registrationNumber}</h3>
              <p className="text-sm text-app-subtext capitalize mb-2">{vehicle.color} {vehicle.makeAndModel}</p>
              
              {vehicle.ownerName && (
                <div className="text-xs text-white/50 mb-4">
                  <span className="font-semibold text-white/80">{vehicle.ownerName}</span> 
                  {vehicle.flatNumber && ` (Flat ${vehicle.flatNumber})`}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-white/10">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  vehicle.type === 'car' ? 'text-blue-400 bg-blue-400/10 border border-blue-400/30' : 
                  'text-purple-400 bg-purple-400/10 border border-purple-400/30'
                }`}>
                  {vehicle.type}
                </span>
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
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Register Vehicle</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Vehicle Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none">
                    <option value="car">Car</option>
                    <option value="bike">Bike / Two-Wheeler</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Registration Number</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtext" />
                    <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white uppercase focus:outline-none focus:border-brand-accent transition-colors" placeholder="e.g. MH-12-AB-1234" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Make & Model</label>
                    <input type="text" name="makeAndModel" value={formData.makeAndModel} onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" placeholder="e.g. Honda City" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Color</label>
                    <input type="text" name="color" value={formData.color} onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" placeholder="e.g. White" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-brand-accent to-purple-600 text-white font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
