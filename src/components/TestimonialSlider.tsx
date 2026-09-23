import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';

const PLACEHOLDER_TESTIMONIALS = [
  {
    name: "Wing Commander Rafiqul Islam",
    role: "Club Incharge, BAFSDBC",
    text: "The BAF Shaheen College Dhaka Business Club has been a transformative platform for our students. It instills entrepreneurial spirit and prepares them for real-world business challenges with confidence.",
    img: "",
  },
  {
    name: "Md. Tanvir Ahmed",
    role: "President, BAFSDBC",
    text: "Being part of this club has reshaped how I think about leadership and strategy. The mentorship and events have given me skills I couldn't have gained in a classroom alone.",
    img: "",
  },
  {
    name: "Nusrat Jahan",
    role: "Vice President, BAFSDBC",
    text: "BAFSDBC taught me that business isn't just about profit — it's about creating impact. Every event, every workshop pushed me to grow beyond my comfort zone.",
    img: "",
  },
];

function AvatarFallback({ name, className = "" }: { name: string; className?: string }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-baf-base to-baf-cyan ${className}`}>
      <span className="text-white font-bold text-3xl sm:text-4xl lg:text-5xl">{initials}</span>
    </div>
  );
}

export function TestimonialSlider() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [fetchedReviews, setFetchedReviews] = useState<any[]>([]);
  const [principal, setPrincipal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDoc(doc(db, 'singleton', 'principal')),
      getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))),
    ]).then(([principalSnap, reviewsSnap]) => {
      if (principalSnap.exists()) {
        const data = principalSnap.data();
        setPrincipal({ name: data.name, role: 'Principal', text: data.speech, img: data.image || '' });
      }
      setFetchedReviews(reviewsSnap.docs.map((d) => {
        const data = d.data();
        return { name: data.name, role: data.role, text: data.speech, img: data.image || '' };
      }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const reviews = useMemo(() => {
    if (loading) return [];
    let combined = [...fetchedReviews];
    if (combined.length === 0) combined = [...PLACEHOLDER_TESTIMONIALS];
    if (principal && !combined.find((r) => r.name === principal.name)) combined.unshift(principal);
    return combined;
  }, [fetchedReviews, principal, loading]);

  const goTo = (idx: number) => {
    setDirection(idx > activeIdx ? 1 : -1);
    setActiveIdx(idx);
  };

  const goNext = () => goTo((activeIdx + 1) % reviews.length);
  const goPrev = () => goTo((activeIdx - 1 + reviews.length) % reviews.length);

  // Auto-advance
  useEffect(() => {
    if (isHovered || reviews.length <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [isHovered, reviews.length, activeIdx]);

  if (loading || reviews.length === 0) return null;

  const active = reviews[activeIdx];

  return (
    <section
      className="py-16 sm:py-24 bg-slate-950 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 4000)}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-baf-cyan/5 rounded-full blur-[130px] mix-blend-screen -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[110px] mix-blend-screen translate-y-1/2" />
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section label */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-[2px] w-8 sm:w-12 bg-baf-cyan" />
            <span className="text-white font-bold tracking-[0.15em] uppercase text-[10px] sm:text-sm">VOICES OF LEADERSHIP</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Inspiring the next{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-baf-cyan to-indigo-400">
              generation
            </span>
          </h2>
        </div>

        {/* Card */}
        <div className="relative bg-white/[0.02] border border-white/5 rounded-[1.75rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-5 sm:p-8 md:p-12 lg:p-16 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-gradient-to-b lg:bg-gradient-to-l from-baf-cyan/[0.03] to-transparent rounded-[2.5rem] pointer-events-none" />

          {/* Mobile layout: vertical stack. Desktop: side by side */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">

            {/* Avatar */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`img-${activeIdx}`}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({ opacity: 0, scale: 0.9, x: dir > 0 ? 30 : -30 }),
                    center: { opacity: 1, scale: 1, x: 0 },
                    exit: (dir: number) => ({ opacity: 0, scale: 0.95, x: dir > 0 ? -30 : 30 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="relative"
                >
                  <div className="absolute -inset-3 bg-baf-cyan/15 blur-2xl rounded-[2rem] z-0 opacity-50" />
                  {/* Responsive avatar size */}
                  <div className="w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 relative z-10 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/10 shadow-xl">
                    {active.img ? (
                      <img src={active.img} alt={active.name} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback name={active.name} className="w-full h-full rounded-[1.5rem] sm:rounded-[2rem]" />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Text content */}
            <div className="lg:col-span-7 flex flex-col relative z-10 text-center lg:text-left w-full">
              {/* Quote icon — desktop only */}
              <div className="mb-4 opacity-20 hidden lg:block">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-baf-cyan">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
              </div>

              {/* Quote text */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`text-${activeIdx}`}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 16 : -16 }),
                    center: { opacity: 1, y: 0 },
                    exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -16 : 16 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35 }}
                  className="w-full mb-6"
                >
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-white/90 leading-relaxed mb-4 italic">
                    "{active.text}"
                  </p>
                  <div>
                    <h4 className="text-white font-bold text-base sm:text-lg md:text-xl mb-1">{active.name}</h4>
                    <p className="text-baf-cyan text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">{active.role}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom nav: dots on mobile, thumbnails on desktop */}
              <div className="pt-5 border-t border-white/10">
                {/* Mobile: arrow + dots nav */}
                <div className="flex lg:hidden items-center justify-center gap-4">
                  <button
                    onClick={goPrev}
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 active:scale-90 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1.5 items-center">
                    {reviews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: activeIdx === idx ? 24 : 6,
                          backgroundColor: activeIdx === idx ? '#25C1C8' : 'rgba(255,255,255,0.2)',
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={goNext}
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 active:scale-90 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Desktop: thumbnail avatars — wrap-safe */}
                <div className="hidden lg:flex flex-wrap gap-3 justify-start items-center">
                  {reviews.map((review, idx) => (
                    review.img ? (
                      <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className={`relative h-12 w-12 rounded-full overflow-hidden border-2 transition-all duration-300 transform ${
                          activeIdx === idx
                            ? 'border-baf-cyan scale-110 shadow-[0_0_18px_rgba(37,193,200,0.35)]'
                            : 'border-white/10 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105'
                        }`}
                      >
                        <img src={review.img} alt={review.name} className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className={`relative h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-xs border-2 bg-gradient-to-br from-baf-base to-baf-cyan transition-all duration-300 transform ${
                          activeIdx === idx
                            ? 'border-baf-cyan scale-110 shadow-[0_0_18px_rgba(37,193,200,0.35)]'
                            : 'border-white/10 opacity-50 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        {review.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated progress bar (desktop only) */}
        {reviews.length > 1 && (
          <div className="hidden sm:flex gap-2 justify-center mt-6">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className="h-1 rounded-full overflow-hidden bg-white/10 transition-all duration-500"
                style={{ width: activeIdx === idx ? 36 : 14 }}
              >
                {activeIdx === idx && (
                  <motion.div
                    className="h-full bg-baf-cyan rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    key={activeIdx}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
