import { Events } from '../components/Events';
import { motion } from 'motion/react';

export default function EventsPage() {
  return (
    <div className="pt-24 pb-20 bg-slate-950 min-h-screen text-white font-sans">
      {/* Hero Header */}
      <div className="relative py-24 mb-16 text-center border-b border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] border border-white/5 rounded-[100%] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[25rem] border border-white/5 rounded-[100%] opacity-40"></div>
        
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            BAFSDBC Events & Workshops
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium tracking-wide"
          >
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-white">Events & Workshops</span>
          </motion.div>
        </div>
      </div>

      <Events hideTitleAndButton={true} />
    </div>
  );
}
