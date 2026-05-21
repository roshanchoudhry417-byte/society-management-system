import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BarChart3, CheckCircle2, Clock, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PollsView = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);

  const fetchPolls = async () => {
    try {
      const res = await api.get('/polls');
      setPolls(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch polls", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleVote = async (pollId, optionId) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionId });
      fetchPolls(); // Refresh to show updated votes
    } catch (err) {
      console.error("Failed to vote", err);
      alert(err.response?.data?.message || 'Failed to submit vote');
    }
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const filteredOptions = options.filter(opt => opt.trim() !== '');
    if (filteredOptions.length < 2) {
      alert('Please provide at least 2 options.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/polls', {
        question,
        options: filteredOptions.map(opt => ({ text: opt })),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days default expiry
      });
      setIsModalOpen(false);
      setQuestion('');
      setOptions(['', '']);
      fetchPolls();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create poll');
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

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="space-y-6 relative min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-brand-accent" />
            Community <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Polls</span>
          </h1>
          <p className="text-app-subtext">Have your say in society decisions</p>
        </div>

        {user?.role !== 'secretary' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="pill-button pill-button-navy px-6 py-3 flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Create Poll</span>
          </button>
        )}
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [1,2].map(i => (
            <div key={i} className="card-navy p-6 animate-pulse border border-white/5">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-white/5 rounded-xl w-full"></div>
                <div className="h-10 bg-white/5 rounded-xl w-full"></div>
              </div>
            </div>
          ))
        ) : polls.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass-panel">
            <BarChart3 className="w-16 h-16 text-brand-accent/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Active Polls</h3>
            <p className="text-app-subtext max-w-sm">There are no decisions to vote on at the moment.</p>
          </div>
        ) : (
          polls.map((poll) => {
            const hasVoted = poll.votedBy?.includes(user?._id);
            const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

            return (
              <motion.div key={poll._id} variants={itemVars} className="card-navy p-6 flex flex-col group hover:border-brand-accent/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${poll.isActive ? 'text-brand-success bg-brand-success/10 border-brand-success/30' : 'text-app-subtext bg-white/5 border-white/10'}`}>
                    {poll.isActive ? 'Active' : 'Closed'}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-app-subtext">
                    <Clock className="w-3 h-3" />
                    {totalVotes} total votes
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-6 leading-tight">{poll.question}</h3>
                
                <div className="space-y-3 mt-auto">
                  {poll.options.map((option) => {
                    const percentage = calculatePercentage(option.votes, totalVotes);
                    return (
                      <button 
                        key={option._id}
                        disabled={hasVoted || !poll.isActive}
                        onClick={() => handleVote(poll._id, option._id)}
                        className={`w-full relative overflow-hidden rounded-xl border text-left transition-all p-4 ${
                          hasVoted 
                            ? 'border-white/10 bg-black/40 cursor-default' 
                            : 'border-white/10 bg-white/5 hover:border-brand-accent/50 hover:bg-brand-accent/10'
                        }`}
                      >
                        {hasVoted && (
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-0 left-0 bottom-0 bg-brand-accent/20 z-0"
                          />
                        )}
                        <div className="relative z-10 flex justify-between items-center">
                          <span className="font-medium text-sm text-white">{option.text}</span>
                          {hasVoted && (
                            <span className="text-xs font-bold text-brand-accent">{percentage}%</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {hasVoted && (
                  <p className="text-xs text-brand-success mt-4 flex items-center justify-center gap-1 font-medium bg-brand-success/10 py-2 rounded-xl border border-brand-success/20">
                    <CheckCircle2 className="w-4 h-4" /> You have already voted on this poll
                  </p>
                )}
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Create Poll Modal */}
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
              
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Create Community Poll</h2>
              
              <form onSubmit={handleCreatePoll} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider mb-2">Question</label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="What would you like to ask the community?"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-app-subtext uppercase tracking-wider">Options</label>
                  {options.map((opt, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-accent transition-colors"
                        placeholder={`Option ${index + 1}`}
                        required={index < 2}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-semibold text-brand-accent hover:text-brand-accent/80 transition-colors flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-4 h-4" /> Add Option
                    </button>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-brand-accent to-purple-600 text-white font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                >
                  {submitting ? 'Creating...' : 'Create Poll'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
