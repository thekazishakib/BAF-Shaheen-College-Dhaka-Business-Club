import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
const ummeImg = "";
const kurratunImg = "";
const samiraImg = "";

const defaultModerators = [];

export function ClubIncharge() {
  const [active, setActive] = useState(0);
  const [moderators, setModerators] = useState<any[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'incharges'), orderBy('createdAt', 'desc'))).then(snap => ({ data: snap.docs.map(d=>d.data()), error: null })).then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        setModerators(data.map(d => ({
          name: d.name,
          role: d.role,
          msg: d.speech,
          img: d.image
        })));
      } else {
        setModerators(defaultModerators);
      }
    });
  }, []);

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-baf-base/5 blur-[120px] rounded-full"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-white mb-6"
          >
            Message From{" "}
            <span className="text-baf-cyan italic">Club Incharge</span>
          </motion.h2>
          <div className="w-16 h-1 bg-gradient-to-r from-baf-base to-baf-cyan mx-auto rounded-full"></div>
        </div>

        <div className="flex flex-col md:flex-row h-auto md:h-[500px] gap-4 w-full">
          {moderators.map((mod, index) => {
            const isActive = active === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setActive(index)}
                className={`relative rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] border-[3px] backdrop-blur-sm ${
                  isActive
                    ? "md:flex-[3] flex-auto h-[400px] md:h-auto border-blue-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] z-10"
                    : "md:flex-[0.6] h-[80px] md:h-auto border-white/20"
                }`}
              >
                <img
                  src={mod.img || undefined}
                  alt={mod.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? "scale-100" : "scale-110 opacity-40"}`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-[#01091A] transition-all duration-[800ms] flex flex-col justify-end ${isActive ? "via-[#01091A]/40 to-transparent p-10 opacity-100" : "via-[#01091A]/80 to-[#01091A]/60 p-4 opacity-50"}`}
                >
                  {/* Normal text for active */}
                  <div
                    className={`transition-all duration-500 max-w-full ${isActive ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-8 h-0 overflow-hidden absolute"}`}
                  >
                    <h3 className="text-2xl lg:text-3xl font-serif text-white mb-2 whitespace-nowrap">
                      {mod.name}
                    </h3>
                    <p className="text-baf-cyan text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-90 whitespace-nowrap bg-black/30 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                      {mod.role}
                    </p>
                    <p className="text-gray-200 text-sm italic leading-relaxed md:line-clamp-3 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                      "{mod.msg}"
                    </p>
                  </div>

                  {/* Vertical text for inactive (Desktop) */}
                  <div
                    className={`absolute inset-x-0 bottom-12 flex justify-center items-end hidden md:flex transition-all duration-500 ${isActive ? "opacity-0 translate-y-8 invisible" : "opacity-100 translate-y-0 delay-300 visible"}`}
                  >
                    <h3
                      className="text-xl font-serif text-white font-bold tracking-widest whitespace-nowrap drop-shadow-md"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      {mod.name.toUpperCase()}
                    </h3>
                  </div>

                  {/* Horizontext for inactive (Mobile) */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center md:hidden transition-all duration-500 ${isActive ? "opacity-0 invisible" : "opacity-100 delay-300 visible"}`}
                  >
                    <h3 className="text-xl font-serif text-white font-bold tracking-widest uppercase">
                      {mod.name}
                    </h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
