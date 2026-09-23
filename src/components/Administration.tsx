import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
const zunaedImg = "";
const tahsinImg = "";
const sheikhImg = "";
const tawhidulImg = "";
const ummeImg = "";
const kurratunImg = "";
const samiraImg = "";
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';

export function Administration() {
  const sections = ['Neutron', 'Atoms', 'Venus', 'Uranus'];
  const defaultModerators = [];

  const defaultExecCommittee = [];

  const [moderators, setModerators] = useState<any[]>([]);
  const [execCommittee, setExecCommittee] = useState<any[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'incharges'), orderBy('createdAt', 'desc'))).then(snap => ({ data: snap.docs.map(d=>d.data()), error: null })).then(({ data, error }) => {
      if (!error && data) {
        setModerators((data as any[]).map(d => ({
          name: d.name,
          role: d.role,
          msg: d.speech,
          img: d.image
        })));
      }
    });

    getDocs(query(collection(db, 'team'), orderBy('createdAt', 'desc'))).then(snap => ({ data: snap.docs.map(d=>d.data()), error: null })).then(({ data, error }) => {
      if (!error && data) {
        setExecCommittee((data as any[]).map(d => ({
          name: d.name,
          role: d.role,
          img: d.image,
          year: d.year || '2026'
        })));
      }
    });
  }, []);

  return (
    <section id="administration" className="py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-baf-base blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-baf-cyan blur-[120px] rounded-full -ml-48 -mb-48"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-serif text-white mb-6"
          >
            Message From <span className="text-baf-cyan italic">Club Incharge</span>
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-baf-base to-baf-cyan mx-auto rounded-full"></div>
        </div>

        {/* Moderator Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {moderators.map((mod, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-[500px] rounded-3xl overflow-hidden border border-white/10"
            >
              <img 
                src={mod.img || undefined} 
                alt={mod.name} 
                className="w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-100" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-8">
                <div className="mb-4 transform group-hover:-translate-y-2 transition-transform duration-500">
                  <h3 className="text-2xl font-serif text-white mb-1">{mod.name}</h3>
                  <p className="text-baf-cyan text-sm font-bold uppercase tracking-wider mb-4 opacity-80">{mod.role}</p>
                  <p className="text-gray-400 text-sm italic leading-relaxed line-clamp-3">
                    "{mod.msg}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Executive Committee */}
        {Object.entries(
          execCommittee.reduce((acc, curr) => {
            const y = curr.year || '2026';
            if (!acc[y]) acc[y] = [];
            acc[y].push(curr);
            return acc;
          }, {} as Record<string, any[]>)
        )
        .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
        .map(([year, members]: [string, any[]]) => (
          <div key={year} className="mb-24">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-5xl font-serif text-white mb-4">Executive Committee</h3>
              <p className="text-baf-cyan text-xl md:text-2xl font-bold tracking-widest mb-4">{year} - {parseInt(year) + 1}</p>
              <p className="text-gray-400 max-w-2xl mx-auto">Meet the dedicated leaders driving the vision and operations of the BAFSD Business Club for the {year} session.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {members.map((exec, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-white/5 bg-slate-900 mb-6">
                    <img 
                       src={exec.img || undefined} 
                       alt={exec.name} 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>
                  <div className="text-center">
                     <h4 className="text-xl font-bold text-white mb-1 group-hover:text-baf-cyan transition-colors">{exec.name}</h4>
                     <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">{exec.role}</p>
                  </div>
                  <div className="absolute -inset-4 bg-white/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity -z-10 blur-xl"></div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}