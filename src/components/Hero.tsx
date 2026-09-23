import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useContactModal } from './ContactModalContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';

const defaultBgImages: string[] = [];

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { openModal } = useContactModal();
  const [bgImages, setBgImages] = useState<string[]>(defaultBgImages);

  useEffect(() => {
    let active = true;
    getDocs(query(collection(db, 'heroImages'), orderBy('createdAt', 'desc'), limit(7)))
      .then((snapshot) => {
        const data = snapshot.docs.map(d=>d.data());
        if (data && active && data.length > 0) {
          setBgImages(data.map(d => d.url));
        }
      })
      .catch((err) => {
        console.error("🔥 Error fetching Hero Images (check Firebase Rules!):", err);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [bgImages.length]);

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden items-center flex min-h-screen justify-center text-center">
      {/* Background Images Auto Slider */}
      <div className="absolute inset-0 z-0">
        {bgImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={img || undefined} alt={`BAFSDBC event — BAF Shaheen College Dhaka Business Club`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" /> {/* Dark overlay for text readability */}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold text-white mb-8 backdrop-blur-md bg-white/5 tracking-[0.2em] uppercase"
        >
          <span className="flex-1 opacity-80 decoration-baf-cyan decoration-2">✦ We Shape Leaders ✦</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-serif text-white leading-tight font-black tracking-tight mb-8 text-balance"
        >
          Empowering Youth <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-baf-base to-baf-cyan italic">Leadership</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
        >
          BAF Shaheen College Dhaka Business Club (BAFSDBC) — est. 2015. Join us to build leadership skills, grow your network, and prepare for the corporate world.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <button
            onClick={openModal}
            className="inline-flex items-center justify-center px-10 py-5 text-sm font-black rounded-full text-white bg-baf-cyan hover:bg-white hover:text-baf-cyan transition-all shadow-[0_10px_40px_-10px_rgba(37,193,200,0.5)] uppercase tracking-wider group"
          >
            Join the Club <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <Link
            to="/about"
            className="inline-flex items-center justify-center px-10 py-5 border-2 border-white/20 text-sm font-black rounded-full text-white hover:bg-white/10 hover:border-white transition-all uppercase tracking-wider"
          >
            Explore More
          </Link>
        </motion.div>
      </div>
      
    </section>
  );
}
