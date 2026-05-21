import React from 'react';
import { BookOpen, ShieldAlert, Volume2, Car, Trash2, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const BylawsView = () => {
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const rules = [
    {
      title: "Noise Regulations",
      icon: <Volume2 className="w-5 h-5 text-brand-accent" />,
      content: "Residents must ensure noise levels are kept to a minimum between 10:00 PM and 7:00 AM. Any construction or renovation work is strictly prohibited on Sundays and public holidays, and limited to 9:00 AM - 5:00 PM on weekdays."
    },
    {
      title: "Parking Rules",
      icon: <Car className="w-5 h-5 text-brand-accent" />,
      content: "Vehicles must be parked only in their designated and allotted parking slots. Visitor vehicles must be parked in the marked 'Visitor Parking' areas only. Horn usage within the society premises is prohibited."
    },
    {
      title: "Waste Management",
      icon: <Trash2 className="w-5 h-5 text-brand-accent" />,
      content: "Wet and dry waste must be segregated at the source. Waste bins should be kept outside the flats before 8:00 AM for collection. Do not dispose of large furniture or electronic waste in common bins."
    },
    {
      title: "Security & Visitors",
      icon: <ShieldAlert className="w-5 h-5 text-brand-accent" />,
      content: "All guests, delivery personnel, and external service providers must be registered at the main gate or pre-approved via the SocietyHub visitor pass system. Residents are responsible for the conduct of their guests."
    },
    {
      title: "Common Areas",
      icon: <Home className="w-5 h-5 text-brand-accent" />,
      content: "Personal items like shoe racks, bicycles, or plants should not obstruct common corridors. Children must be supervised in the clubhouse, swimming pool, and gym areas."
    }
  ];

  return (
    <div className="space-y-6 relative min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-brand-accent" />
            Society <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">Bylaws</span>
          </h1>
          <p className="text-app-subtext">Rules and regulations for harmonious community living</p>
        </div>
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-4xl space-y-6">
        <motion.div variants={itemVars} className="card-navy p-8 bg-gradient-to-br from-brand-accent/10 to-transparent border-brand-accent/30">
          <h3 className="text-xl font-bold text-white mb-4">Preamble</h3>
          <p className="text-app-subtext leading-relaxed">
            These bylaws are established to promote the safety, health, and welfare of all residents within the society. By residing in this society, all owners, tenants, and their guests agree to abide by these rules. The management committee reserves the right to amend these bylaws as necessary.
          </p>
        </motion.div>

        {rules.map((rule, idx) => (
          <motion.div key={idx} variants={itemVars} className="card-navy p-6 flex gap-6 group hover:border-white/20 transition-colors">
            <div className="hidden sm:flex flex-col items-center justify-start pt-1">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:bg-brand-accent/10 group-hover:border-brand-accent/30 transition-all">
                {rule.icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
                <span className="sm:hidden">{rule.icon}</span>
                {rule.title}
              </h3>
              <p className="text-sm text-app-subtext leading-relaxed">{rule.content}</p>
            </div>
          </motion.div>
        ))}
        
        <motion.div variants={itemVars} className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-app-subtext">
            For a complete copy of the registered society bylaws, please contact the administrative office.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
