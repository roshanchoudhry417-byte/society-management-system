import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Building, Phone, ArrowRight, Loader2, KeyRound, ShieldCheck, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState('resident'); // 'resident' | 'secretary'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    flatNumber: '',
    phone: '',
    role: 'resident'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSwitch = (role) => {
    setLoginRole(role);
    setFormData({ ...formData, role });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({ ...formData, role: loginRole });
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-[1000px] w-full glass-panel overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-white/10 shadow-2xl relative"
      >
        
        {/* Left Side: Branding/Visual (Dark Mode Abstract) */}
        <div className="md:w-[45%] bg-black/60 p-12 text-white flex flex-col justify-between relative overflow-hidden border-r border-white/5">
          {/* Animated Background Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -left-32 w-96 h-96 bg-brand-accent/30 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-success/20 rounded-full blur-[100px]"
          />
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-accent to-purple-500 flex items-center justify-center shadow-glow mb-8">
               <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light leading-tight mb-6 tracking-tight">
              Premium <br />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Living.</span> <br />
              Simplified.
            </h1>
            <p className="text-app-subtext text-lg max-w-sm font-light">
              Experience the future of society management. Secure, fast, and beautifully designed.
            </p>
          </div>
          
          <div className="relative z-10">
            <div className="flex gap-2">
              <div className="w-12 h-1 bg-brand-accent rounded-full shadow-glow"></div>
              <div className="w-2 h-1 bg-white/20 rounded-full"></div>
              <div className="w-2 h-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-[55%] p-8 md:p-12 flex flex-col justify-center bg-app-card/30 backdrop-blur-sm relative">
          <div className="max-w-sm mx-auto w-full relative z-10">

            {/* Role Toggle: Secretary / Society Member */}
            <div className="flex bg-black/30 rounded-2xl p-1.5 border border-white/5 mb-8">
              <button
                type="button"
                onClick={() => handleRoleSwitch('resident')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  loginRole === 'resident'
                    ? 'bg-brand-accent text-white shadow-glow'
                    : 'text-app-subtext hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Society Member
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('secretary')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  loginRole === 'secretary'
                    ? 'bg-brand-accent text-white shadow-glow'
                    : 'text-app-subtext hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Secretary
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${isLogin}-${loginRole}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-app-subtext text-sm">
                    {isLogin 
                      ? `Sign in as ${loginRole === 'secretary' ? 'Secretary' : 'Society Member'} to access your dashboard.`
                      : `Register as ${loginRole === 'secretary' ? 'Secretary' : 'Society Member'} to join the community.`}
                  </p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-sm mb-6 border border-red-500/20 backdrop-blur-md"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-subtext group-focus-within:text-brand-accent transition-colors" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        className="pill-input pl-12"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-subtext group-focus-within:text-brand-accent transition-colors" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      className="pill-input pl-12"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-subtext group-focus-within:text-brand-accent transition-colors" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="pill-input pl-12"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-subtext group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type="text"
                          name="flatNumber"
                          placeholder={loginRole === 'secretary' ? 'Office #' : 'Flat #'}
                          className="pill-input pl-12"
                          value={formData.flatNumber}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-subtext group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type="text"
                          name="phone"
                          placeholder="Phone"
                          className="pill-input pl-12"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="pill-button pill-button-navy w-full py-4 mt-6 text-lg group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          {isLogin ? 'Sign In' : 'Create Account'}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-sm font-medium text-app-subtext hover:text-white transition-colors"
                  >
                    {isLogin 
                      ? "Don't have an account? " 
                      : "Already have an account? "}
                    <span className="text-brand-accent font-semibold">{isLogin ? 'Sign up' : 'Sign in'}</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
