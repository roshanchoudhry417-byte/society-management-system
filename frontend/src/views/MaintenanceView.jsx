import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Settings, Wrench, Shield, Droplets, Zap, Trash2, CreditCard, Download, CheckCircle2, XCircle, Clock, QrCode, Lock, Check, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MaintenanceView = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card'
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'failed'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [txDetails, setTxDetails] = useState(null);

  const fetchPayments = async () => {
    try {
      const isAdminOrSecretary = user?.role === 'admin' || user?.role === 'secretary';
      const res = await api.get(isAdminOrSecretary ? '/payments' : '/payments/my');
      setPayments(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const executeMockPayment = async () => {
    if (!paymentTarget) return;
    
    setPaymentStatus('processing');
    
    setTimeout(async () => {
      try {
        const mockPayId = 'pay_mock_' + Math.random().toString(36).substr(2, 9);
        const mockSig = 'sig_mock_' + Math.random().toString(36).substr(2, 9);
        const orderId = paymentTarget.razorpayOrderId || ('order_mock_' + paymentTarget._id);
        
        await api.post('/payments/verify', {
          razorpayOrderId: orderId,
          razorpayPaymentId: mockPayId,
          razorpaySignature: mockSig
        });
        
        setTxDetails({
          id: mockPayId,
          amount: paymentTarget.amount,
          description: paymentTarget.description || 'Monthly Maintenance',
          date: new Date().toLocaleString(),
        });
        
        setPaymentStatus('success');
        fetchPayments();
      } catch (err) {
        console.error(err);
        setPaymentStatus('failed');
      }
    }, 2000);
  };

  const handlePay = async (paymentToPay) => {
    try {
      let targetPayment = paymentToPay;
      
      // 1. Create a payment order if none exists/specified
      if (!targetPayment) {
        const pendingPayment = payments.find(p => p.status === 'pending');
        if (pendingPayment) {
          targetPayment = pendingPayment;
        } else {
          setLoading(true);
          const res = await api.post('/payments/create-order', {
            amount: 1500,
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            description: 'Monthly Maintenance Fee',
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear(),
          });
          targetPayment = res.data.data.payment;
          await fetchPayments();
        }
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        console.warn('Failed to load Razorpay SDK. Falling back to simulated checkout.');
      }

      // 3. Initiate payment
      if (scriptLoaded && targetPayment.razorpayOrderId && !targetPayment.razorpayOrderId.startsWith('order_mock_')) {
        const options = {
          key: 'rzp_test_placeholder',
          amount: targetPayment.amount * 100,
          currency: 'INR',
          name: 'SocietyHub',
          description: targetPayment.description || 'Maintenance Payment',
          order_id: targetPayment.razorpayOrderId,
          handler: async function (response) {
            try {
              setLoading(true);
              await api.post('/payments/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              
              setTxDetails({
                id: response.razorpay_payment_id,
                amount: targetPayment.amount,
                description: targetPayment.description || 'Monthly Maintenance',
                date: new Date().toLocaleString(),
              });
              setPaymentTarget(targetPayment);
              setPaymentStatus('success');
              setIsPaymentModalOpen(true);
              fetchPayments();
            } catch (err) {
              console.error(err);
              alert('Payment verification failed.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          theme: {
            color: '#8b5cf6'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setPaymentTarget(targetPayment);
        setPaymentMethod('upi');
        setPaymentStatus('idle');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardHolder(user?.name || '');
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      console.error('Payment flow failed', err);
      alert('An error occurred during checkout.');
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

  const isSecretary = user?.role === 'secretary';
  const breakdown = [
    { name: 'Common Area Electricity', amount: isSecretary ? 0 : 300, icon: <Zap className="w-5 h-5" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { name: 'Water Charges', amount: isSecretary ? 0 : 250, icon: <Droplets className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Security Services', amount: isSecretary ? 0 : 400, icon: <Shield className="w-5 h-5" />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Housekeeping & Garbage', amount: isSecretary ? 0 : 200, icon: <Trash2 className="w-5 h-5" />, color: 'text-green-400', bg: 'bg-green-400/10' },
    { name: 'Lift & Equipment Maintenance', amount: isSecretary ? 0 : 350, icon: <Settings className="w-5 h-5" />, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  ];

  const pendingPayment = payments.find(p => p.status === 'pending');

  return (
    <div className="space-y-6 relative min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight flex items-center gap-3">
            <Wrench className="w-8 h-8 text-brand-accent" />
            Maintenance <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Breakdown</span>
          </h1>
          <p className="text-app-subtext">Understand how your monthly society dues are utilized</p>
        </div>
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Total Summary */}
        <motion.div variants={itemVars} className="lg:col-span-4 card-navy p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-brand-accent/20 transition-colors duration-700"></div>
          
          <h3 className="text-sm font-semibold text-app-subtext uppercase tracking-wider mb-6">Total Monthly Dues</h3>
          
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-glow absolute inset-0">
              <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
              <motion.circle 
                cx="96" cy="96" r="88" fill="transparent" stroke="#8b5cf6" strokeWidth="16" 
                strokeDasharray="553" 
                initial={{ strokeDashoffset: 553 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                strokeLinecap="round" 
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-white">{user?.role === 'secretary' ? '$0' : '$1,500'}</span>
              <span className="text-xs text-brand-accent uppercase tracking-widest font-semibold mt-1">Per Flat</span>
            </div>
          </div>
          
          <p className="text-sm text-app-subtext leading-relaxed">
            These funds are utilized for the daily upkeep, security, and long-term maintenance of the society infrastructure.
          </p>

          {loading ? (
            <div className="mt-6 w-full h-11 bg-white/5 rounded-full animate-pulse"></div>
          ) : user?.role === 'secretary' ? (
            <div className="mt-6 w-full flex items-center justify-center gap-2 text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-full px-5 py-2.5 text-xs font-semibold">
              <Check className="w-4 h-4 stroke-[3]" /> Secretary Role - Exempt from Dues
            </div>
          ) : (
            <div className="mt-6 w-full space-y-3">
              {!pendingPayment && (
                <div className="w-full flex items-center justify-center gap-2 text-brand-success bg-brand-success/10 border border-brand-success/20 rounded-full px-5 py-2.5 text-xs font-semibold">
                  <Check className="w-4 h-4 stroke-[3]" /> Dues Paid & Up-to-date
                </div>
              )}
              <button
                onClick={() => handlePay(pendingPayment || null)}
                className="w-full py-3 px-6 pill-button pill-button-navy bg-gradient-to-r from-brand-accent to-purple-600 font-bold border-none hover:opacity-90 shadow-glow flex items-center justify-center gap-2 text-white"
              >
                <CreditCard className="w-4 h-4" />
                {pendingPayment ? 'Pay Maintenance' : 'Pay Now'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Right: Breakdown List */}
        <motion.div variants={itemVars} className="lg:col-span-8 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Cost Allocation</h3>
          {breakdown.map((item, idx) => (
            <motion.div key={idx} variants={itemVars} className="card-navy p-5 flex items-center gap-6 group hover:border-brand-accent/30 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 shadow-inner ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors">{item.name}</h4>
                  <span className="text-lg font-bold text-white">${item.amount}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <motion.div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-brand-accent to-purple-500 shadow-glow" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.amount / 1500) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                  ></motion.div>
                </div>
                <div className="text-[10px] text-app-subtext mt-1 text-right">{Math.round((item.amount / 1500) * 100)}%</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Society Maintenance List for Admin/Secretary */}
      {(user?.role === 'admin' || user?.role === 'secretary') && (
        <motion.div variants={itemVars} className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Society Maintenance Status</h3>
          <div className="card-navy p-6 flex flex-col group hover:border-brand-accent/30 transition-colors">
            {payments.length === 0 ? (
               <p className="text-app-subtext">No payments data available.</p>
            ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-white/10 text-xs text-app-subtext uppercase tracking-wider">
                       <th className="p-3 font-semibold">Resident</th>
                       <th className="p-3 font-semibold">Flat</th>
                       <th className="p-3 font-semibold">Description</th>
                       <th className="p-3 font-semibold">Amount</th>
                       <th className="p-3 font-semibold">Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     {payments.map(payment => (
                       <tr key={payment._id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                         <td className="p-3 text-white">{payment.userId?.name || 'Unknown'}</td>
                         <td className="p-3 text-app-subtext">{payment.userId?.flatNumber || 'N/A'}</td>
                         <td className="p-3 text-app-subtext">{payment.description}</td>
                         <td className="p-3 text-white">${payment.amount}</td>
                         <td className="p-3">
                           <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                             payment.status === 'completed' ? 'text-brand-success bg-brand-success/10 border border-brand-success/30' : 
                             payment.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30' : 
                             'text-red-400 bg-red-400/10 border border-red-400/30'
                           }`}>
                             {payment.status}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Simulated Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && paymentTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => paymentStatus !== 'processing' && setIsPaymentModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl z-10"
            >
              {/* Close Button */}
              {paymentStatus !== 'processing' && (
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="absolute top-6 right-6 text-app-subtext hover:text-white transition-colors z-20"
                >
                  <X className="w-6 h-6" />
                </button>
              )}

              {paymentStatus === 'idle' && (
                <div className="p-8">
                  {/* Summary */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-accent uppercase tracking-wider mb-2">
                      <CreditCard className="w-4 h-4" />
                      Secure Checkout
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {paymentTarget.description || 'Monthly Maintenance'}
                    </h2>
                    <p className="text-sm text-app-subtext">
                      Due: {paymentTarget.month} {paymentTarget.year}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/5 mb-6 flex justify-between items-center">
                    <span className="text-sm font-medium text-app-subtext">Total Amount</span>
                    <span className="text-3xl font-extrabold text-white">
                      ${paymentTarget.amount}.00
                    </span>
                  </div>

                  {/* Payment Tabs */}
                  <div className="flex bg-black/30 rounded-xl p-1 border border-white/5 mb-6">
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'upi'
                          ? 'bg-brand-accent text-white shadow-glow'
                          : 'text-app-subtext hover:text-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      UPI Scanner
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-brand-accent text-white shadow-glow'
                          : 'text-app-subtext hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Mock Card
                    </button>
                  </div>

                  {/* Payment Forms */}
                  {paymentMethod === 'upi' ? (
                    /* UPI Scan View */
                    <div className="space-y-6 flex flex-col items-center">
                      <div className="relative p-4 rounded-3xl bg-white border border-white/10 shadow-lg group">
                        {/* Decorative Scanner Box corners */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-accent rounded-tl-xl -mt-[2px] -ml-[2px]"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-accent rounded-tr-xl -mt-[2px] -mr-[2px]"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-accent rounded-bl-xl -mb-[2px] -ml-[2px]"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-accent rounded-br-xl -mb-[2px] -mr-[2px]"></div>
                        
                        {/* Animated Scanner Laser */}
                        <div className="absolute top-2 left-2 right-2 h-1 bg-brand-accent shadow-[0_0_10px_rgba(139,92,246,0.8)] animate-[scan_3s_ease-in-out_infinite] z-10 pointer-events-none"></div>

                        {/* Custom SVG QR Code */}
                        <svg className="w-44 h-44 text-zinc-900" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                          <path d="M40,5 h10 v5 h-10 z M55,0 h10 v15 h-10 z M45,20 h20 v5 h-20 z M35,15 h5 v15 h-5 z M0,40 h15 v5 h-15 z M25,40 h10 v10 h-10 z M5,55 h10 v10 h-10 z M20,60 h10 v5 h-10 z" />
                          <path d="M40,40 h15 v5 h-15 z M60,40 h10 v10 h-10 z M45,55 h10 v15 h-10 z M40,80 h15 v5 h-15 z M65,80 h10 v15 h-10 z M80,45 h20 v10 h-20 z M85,65 h10 v10 h-10 z M90,85 h10 v10 h-10 z" />
                        </svg>
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-sm font-semibold text-white">Scan to Pay via UPI</p>
                        <p className="text-xs text-app-subtext max-w-[280px] mx-auto">
                          Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, BHIM) to initiate simulated checkout.
                        </p>
                      </div>

                      <button
                        onClick={executeMockPayment}
                        className="w-full py-4 mt-2 pill-button pill-button-navy font-bold text-white bg-gradient-to-r from-brand-accent to-purple-600 border-none hover:opacity-90 flex items-center justify-center gap-2"
                      >
                        Confirm Simulated Scan & Pay
                      </button>
                    </div>
                  ) : (
                    /* Mock Card View */
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        executeMockPayment();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          maxLength="19"
                          value={cardNumber}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            let matches = v.match(/\d{4,16}/g);
                            let match = matches && matches[0] || '';
                            let parts = [];
                            for (let i=0, len=match.length; i<len; i+=4) {
                              parts.push(match.substring(i, i+4));
                            }
                            if (parts.length > 0) {
                              setCardNumber(parts.join(' '));
                            } else {
                              setCardNumber(v);
                            }
                          }}
                          placeholder="4111 2222 3333 4444"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            required
                            maxLength="5"
                            value={cardExpiry}
                            onChange={(e) => {
                              let v = e.target.value.replace(/[^0-9]/gi, '');
                              if (v.length >= 2) {
                                setCardExpiry(v.substring(0, 2) + '/' + v.substring(2, 4));
                              } else {
                                setCardExpiry(v);
                              }
                            }}
                            placeholder="12/28"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider">
                            CVV
                          </label>
                          <input
                            type="password"
                            required
                            maxLength="3"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/gi, ''))}
                            placeholder="***"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors text-sm"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-app-subtext">
                        <Lock className="w-3.5 h-3.5 text-brand-success" />
                        <span>Mock checkout. No real card details required.</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 mt-2 pill-button pill-button-navy font-bold text-white bg-gradient-to-r from-brand-accent to-purple-600 border-none hover:opacity-90 flex items-center justify-center animate-glow"
                      >
                        Pay ${paymentTarget.amount}.00
                      </button>
                    </form>
                  )}
                </div>
              )}

              {paymentStatus === 'processing' && (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-brand-accent/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-brand-accent rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Verifying Transaction</h3>
                    <p className="text-sm text-app-subtext max-w-xs">
                      Please wait while we establish secure connection and verify details with the payment gateway.
                    </p>
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && txDetails && (
                <div className="p-8 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-brand-success/15 border-2 border-brand-success flex items-center justify-center mb-6 text-brand-success shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  >
                    <Check className="w-10 h-10 stroke-[3]" />
                  </motion.div>

                  <h3 className="text-2xl font-extrabold text-white mb-2">Payment Successful</h3>
                  <p className="text-sm text-app-subtext mb-6">Your transaction has been processed successfully.</p>

                  <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 mb-8 text-left space-y-3.5">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-xs font-semibold text-app-subtext uppercase">Transaction ID</span>
                      <span className="text-xs font-mono font-bold text-white select-all">{txDetails.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-app-subtext uppercase">Paid For</span>
                      <span className="text-xs font-bold text-white">{txDetails.description}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-app-subtext uppercase">Date & Time</span>
                      <span className="text-xs font-bold text-white">{txDetails.date}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <span className="text-xs font-semibold text-app-subtext uppercase">Amount Paid</span>
                      <span className="text-lg font-black text-brand-success">${txDetails.amount}.00</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="w-full py-4 pill-button pill-button-navy font-bold text-white bg-gradient-to-r from-brand-success to-emerald-600 border-none hover:opacity-90 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    Done
                  </button>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500 flex items-center justify-center mb-6 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    <AlertCircle className="w-10 h-10 stroke-[2]" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-white mb-2">Payment Failed</h3>
                  <p className="text-sm text-app-subtext mb-6">We could not process your payment at this moment.</p>

                  <div className="flex gap-4 w-full">
                    <button
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="flex-1 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeMockPayment}
                      className="flex-1 py-4 rounded-xl bg-brand-accent hover:opacity-90 text-white font-bold transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
