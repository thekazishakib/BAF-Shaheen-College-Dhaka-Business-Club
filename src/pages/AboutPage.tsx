import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';
import { Counter } from '../components/Counter';
const img1 = "";
import img3 from '../../public/BAFSDBC_Logo_BG_removed.png';
import { useContactModal } from '../components/ContactModalContext';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { StartupRoadmap } from '../components/StartupRoadmap';

export default function AboutPage() {
  const { openModal } = useContactModal();
  const [cta, setCta] = useState({ title: "We Are Always Ready To Shape Leaders", subTitle: "Join Us Now", buttonText: "Get Started", image: img1, logo: '' });

  useEffect(() => {
    getDocs(query(collection(db, 'singleton'), where('id', '==', 'aboutCTA'), limit(1))).then(snap => ({ data: snap.docs[0]?.data(), error: null })).then(({ data, error }) => {
      if (!error && data) setCta(data as any);
      if (error) handleFirestoreError(error, OperationType.GET, 'singleton/aboutCTA');
    });
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen text-white pt-24 pb-20 font-sans">
      
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
            About BAFSDBC
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium tracking-wide"
          >
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-white">About BAFSDBC</span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        
        {/* Section 1: About Us */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden h-[400px] lg:h-[500px] flex items-center justify-center p-8 bg-white/5"
          >
            <img src={img3 || undefined} alt="BAFSDBC — BAF Shaheen College Dhaka Business Club official logo and team" className="w-full h-full object-contain" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-4">About Us</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              BAF Shaheen College<br />Dhaka Business Club
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed font-medium mb-10">
              We strive to bridge the gap between academic theory and practical business applications. By fostering an environment of innovation, critical thinking, and leadership, we prepare our members to tackle real-world challenges. Our vision is to empower individuals who not only excel in their professional careers but also contribute meaningfully and ethically to the global business community.
            </p>
            <div>
              <button onClick={openModal} className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors text-sm">
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/40 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] border border-white/5 hover:border-baf-cyan/30 transition-all duration-500 flex flex-col justify-center"
          >
            <h3 className="text-3xl font-bold mb-6 text-white">Our Mission</h3>
            <p className="text-gray-400 text-base leading-relaxed font-medium">
              Our mission is to empower students through leadership and innovation, providing them with the practical skills needed to succeed in the modern business world. We aim to create a platform where theoretical knowledge meets practical execution, preparing our members for excellence.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/40 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] border border-white/5 hover:border-white/30 transition-all duration-500 flex flex-col justify-center"
          >
            <h3 className="text-3xl font-bold mb-6 text-white">Our Vision</h3>
            <p className="text-gray-400 text-base leading-relaxed font-medium">
              We envision a network of empowered individuals who not only excel in their careers but also contribute meaningfully and ethically to the global business community. Our goal is to be the premier platform for student leadership and entrepreneurial growth.
            </p>
          </motion.div>
        </div>

        {/* Section 3: Our Skills */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold mb-4">Our Skills</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium mb-10">
              We focus on building practical skills that are directly applicable to the modern business landscape, cultivating a community of future leaders.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Leadership & Management</span>
                  <span>85%</span>
                </div>
                <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-white"
                  ></motion.div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Event Organization</span>
                  <span>90%</span>
                </div>
                <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '90%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-white"
                  ></motion.div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Public Speaking</span>
                  <span>77%</span>
                </div>
                <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '77%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-white"
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-y-16 gap-x-8 text-center pt-4"
          >
            <div>
              <h4 className="text-4xl form-serif font-bold text-white mb-2">2015</h4>
              <p className="text-xs tracking-wider text-gray-400 font-bold uppercase">Established</p>
            </div>
            <div>
              <h4 className="text-4xl form-serif font-bold text-white mb-2"><Counter to={50} />+</h4>
              <p className="text-xs tracking-wider text-gray-400 font-bold uppercase">Events Organized</p>
            </div>
            <div>
              <h4 className="text-4xl form-serif font-bold text-white mb-2"><Counter to={5000} />+</h4>
              <p className="text-xs tracking-wider text-gray-400 font-bold uppercase">Lifetime Members</p>
            </div>
            <div>
              <h4 className="text-4xl form-serif font-bold text-white mb-2">1st</h4>
              <p className="text-xs tracking-wider text-gray-400 font-bold uppercase">Business Relevant Club</p>
            </div>
          </motion.div>
        </div>

        {/* Section 4: Startup Roadmap */}
        <StartupRoadmap />

        {/* Section 5: Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden"
        >
          <div className="absolute inset-0 h-[300px] md:h-[400px]">
            <img src={cta.image || img1 || undefined} alt="Team background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
            {cta.logo && (
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <img src={cta.logo || undefined} alt="CTA BG Logo" className="w-64 md:w-96 object-contain" />
              </div>
            )}
          </div>
          
          <div className="relative z-10 py-20 px-4 flex flex-col items-center justify-center text-center h-[300px] md:h-[400px]">
             <p className="text-sm font-bold tracking-widest text-gray-300 uppercase mb-4">{cta.subTitle}</p>
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-10 max-w-2xl leading-tight">
               {cta.title}
             </h2>
             <button onClick={openModal} className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors text-sm shadow-xl">
               {cta.buttonText}
             </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
