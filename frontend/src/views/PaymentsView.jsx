import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { CreditCard, Download, CheckCircle2, XCircle, Clock, QrCode, Lock, Check, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PaymentsView = () => {
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
    fetchPayments();
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
      // Check if real Razorpay order was successfully created (not starting with 'order_mock_')
      if (scriptLoaded && targetPayment.razorpayOrderId && !targetPayment.razorpayOrderId.startsWith('order_mock_')) {
        const options = {
          key: 'rzp_test_placeholder', // Or user custom key if returned by backend
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
        // Open our premium simulated checkout modal
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-brand-success" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  // Calculate outstanding dues dynamically
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const outstandingAmount = pendingPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 relative min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-brand-accent" />
            Financial <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Transactions</span>
          </h1>
          <p className="text-app-subtext">Manage dues, maintenance fees, and view your payment history</p>
        </div>
      </div>

      {/* Dues Summary Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-navy p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-br from-black/40 to-brand-accent/5 border-brand-accent/20">
        <div>
          <h3 className="text-sm font-semibold text-app-subtext uppercase tracking-wider mb-2">Total Outstanding Dues</h3>
          <div className="text-5xl font-light text-white">${outstandingAmount || 0}<span className="text-2xl text-app-subtext">.00</span></div>
          <p className="text-xs text-app-subtext mt-2 flex items-center gap-2">
            <Clock className="w-3 h-3 text-yellow-400" /> 
            {outstandingAmount > 0 ? 'Dues pending payment' : 'No outstanding payments'}
          </p>
        </div>
        {user?.role !== 'secretary' && (
          <button 
            onClick={() => handlePay()}
            disabled={loading}
            className="pill-button pill-button-navy px-8 py-4 w-full md:w-auto text-lg shadow-glow bg-gradient-to-r from-brand-accent to-purple-600 border-none hover:opacity-90"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        )}
      </motion.div>

      <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-3">
        {loading && payments.length === 0 ? (
          [1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse"></div>)
        ) : payments.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center glass-panel">
            <CreditCard className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Transactions</h3>
            <p className="text-app-subtext max-w-sm">Your payment history is empty.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <motion.div key={payment._id} variants={itemVars} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 hover:bg-white/5 transition-colors border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  {getStatusIcon(payment.status)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white capitalize">{payment.description || payment.type?.replace('-', ' ')}</h4>
                  <p className="text-xs text-app-subtext">{new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-lg font-bold text-white">${payment.amount}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    payment.status === 'completed' ? 'text-brand-success' : 
                    payment.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {payment.status}
                  </div>
                </div>
                {payment.status === 'pending' ? (
                  <button 
                    onClick={() => handlePay(payment)}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-brand-accent hover:opacity-90 text-white text-xs font-semibold transition-opacity"
                  >
                    Pay Dues
                  </button>
                ) : (
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-app-subtext hover:text-white hover:bg-white/10 transition-colors" title="Download Receipt">
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

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
                        className="w-full py-4 mt-2 pill-button pill-button-navy font-bold text-white bg-gradient-to-r from-brand-accent to-purple-600 border-none hover:opacity-90 flex items-center justify-center"
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
