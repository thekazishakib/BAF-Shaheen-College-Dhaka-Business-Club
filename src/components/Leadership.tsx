import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
const zunaedImg = "";
const tahsinImg = "";
const sheikhImg = "";
const tawhidulImg = "";
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';

const defaultExecCommittee = [];

export function Leadership({ limit }: { limit?: number }) {
  const [execCommittee, setExecCommittee] = useState<any[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'team'), orderBy('createdAt', 'desc'))).then((snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      if (data) {
        setExecCommittee((data as any[]).map(d => ({
          name: d.name,
          role: d.role,
          img: d.image,
          year: d.year || '2026'
        })));
      }
    }).catch(console.error);
  }, []);

  const maxYear = execCommittee.length > 0 ? Math.max(...execCommittee.map(c => parseInt(c.year || '2026'))) : null;
  let displayCommittee = maxYear ? execCommittee.filter(c => parseInt(c.year || '2026') === maxYear) : [];
  if (limit) {
    displayCommittee = displayCommittee.slice(0, limit);
  }

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-white mb-6"
          >
            Executive <span className="text-baf-cyan italic">Committee</span> & Heads
          </motion.h2>
          <div className="w-16 h-1 bg-gradient-to-r from-baf-base to-baf-cyan mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium">Meet the dedicated leaders driving the vision and operations of the BAFSD Business Club.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCommittee.map((exec, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900 mb-6 relative">
                <img 
                   src={exec.img || undefined} 
                   alt={exec.name} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
              <div className="text-center">
                 <h4 className="text-xl font-bold text-white mb-1 group-hover:text-baf-cyan transition-colors">{exec.name}</h4>
                 <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{exec.role}</p>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}
