import { Administration } from '../components/Administration';
import { motion } from 'motion/react';
import { useContactModal } from '../components/ContactModalContext';

export default function TeamPage() {
  const { openModal } = useContactModal();

  return (
    <div className="pt-24 pb-32 bg-slate-950 text-white min-h-screen font-sans">
      {/* Hero Header */}
      <div className="relative py-24 mb-24 text-center border-b border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] border border-white/5 rounded-[100%] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[25rem] border border-white/5 rounded-[100%] opacity-40"></div>
        
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            BAFSDBC Executive Committee
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium tracking-wide"
          >
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-white">Executive Team</span>
          </motion.div>
        </div>
      </div>
      
      <Administration />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-40">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] p-16 text-center relative overflow-hidden border border-white/5"
        >
           <div className="absolute top-0 right-0 w-96 h-96 bg-baf-base/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
           <h2 className="text-4xl font-serif font-bold mb-8 relative z-10 italic">Want to join our executive committee?</h2>
           <p className="text-gray-400 mb-10 max-w-2xl mx-auto relative z-10 text-lg font-medium leading-relaxed">
             We are always looking for passionate individuals to help us grow. Applications for the next session open soon.
           </p>
           <button onClick={openModal} className="bg-white text-black font-black uppercase tracking-widest text-xs py-5 px-12 rounded-full hover:bg-baf-cyan transition-all relative z-10">
             Explore Vacancy
           </button>
        </motion.div>
      </div>
    </div>
  );
}
