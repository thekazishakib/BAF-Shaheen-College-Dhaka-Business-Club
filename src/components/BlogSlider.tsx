import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { renderExcerpt } from '../lib/renderExcerpt';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseDateMs(raw: any): number {
  if (!raw) return 0;
  // Firestore Timestamp
  if (raw?.seconds) return raw.seconds * 1000;
  // String like "15th March 2025" or "March 15, 2025"
  if (typeof raw === 'string') {
    const clean = raw.replace(/(\d+)(st|nd|rd|th)/i, '$1');
    const ms = new Date(clean).getTime();
    if (!isNaN(ms)) return ms;
  }
  // number ms
  if (typeof raw === 'number') return raw;
  return 0;
}

function formatDate(raw: any): string {
  try {
    const d = new Date(raw?.seconds ? raw.seconds * 1000 : raw);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

// Responsive cards per page based on window width
function useCardsPerPage() {
  const [cards, setCards] = useState(1);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCards(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return cards;
}

export function BlogSlider() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const cardsPerPage = useCardsPerPage();
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')))
      .then((snap) => {
        const data = snap.docs.map((d, i) => {
          const raw = d.data();
          return {
            id: raw.id || d.id || `blog-${i}`,
            title: raw.title || 'Untitled',
            excerpt: raw.excerpt || raw.content || '',
            date: raw.date ? formatDate(raw.date) : formatDate(raw.createdAt),
            _sortMs: parseDateMs(raw.date) || parseDateMs(raw.createdAt),
            image: raw.image || '',
            category: raw.category || 'Insight',
          };
        });
        // Sort by actual blog date descending (newest first)
        data.sort((a, b) => b._sortMs - a._sortMs);
        setBlogs(data);
        setCurrentIndex(0);
      })
      .catch(() => {});
  }, []);

  // Reset index when screen size changes
  useEffect(() => { setCurrentIndex(0); }, [cardsPerPage]);

  const totalPages = Math.max(1, Math.ceil(blogs.length / cardsPerPage));
  const currentPage = Math.floor(currentIndex / cardsPerPage);
  const canNavigate = blogs.length > cardsPerPage;

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    setDirection(1);
    setCurrentIndex((prev) => {
      const next = prev + cardsPerPage;
      return next >= blogs.length ? 0 : next;
    });
  }, [blogs.length, cardsPerPage, canNavigate]);

  const goPrev = useCallback(() => {
    if (!canNavigate) return;
    setDirection(-1);
    setCurrentIndex((prev) => {
      const next = prev - cardsPerPage;
      return next < 0 ? Math.max(0, blogs.length - cardsPerPage) : next;
    });
  }, [blogs.length, cardsPerPage, canNavigate]);

  // Auto-slide, pauses on hover/touch
  useEffect(() => {
    if (isHovered || !canNavigate) return;
    autoRef.current = setInterval(goNext, 4500);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [isHovered, canNavigate, goNext]);

  // Get visible blogs, wrap around if needed
  const visibleBlogs = (() => {
    const slice = blogs.slice(currentIndex, currentIndex + cardsPerPage);
    if (slice.length < cardsPerPage && blogs.length > 0) {
      slice.push(...blogs.slice(0, cardsPerPage - slice.length));
    }
    return slice;
  })();

  // Grid cols class
  const gridCols = cardsPerPage === 3
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    : cardsPerPage === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-1';

  return (
    <section
      className="py-16 sm:py-24 bg-slate-950 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 3000)}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[400px] bg-baf-cyan/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="flex flex-row justify-between items-end mb-10 sm:mb-14 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[2px] w-8 bg-baf-cyan" />
              <span className="text-baf-cyan font-bold tracking-[0.15em] uppercase text-[10px] sm:text-xs">LATEST BLOGS</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-2"
            >
              Latest <span className="text-baf-cyan italic">Insights</span>
            </motion.h2>
            <p className="text-gray-400 text-sm sm:text-base font-medium max-w-xs sm:max-w-md hidden sm:block">
              Dive into our collection of business articles and student experiences.
            </p>
          </div>

          {/* Nav arrows — always visible when needed */}
          {canNavigate && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={goPrev}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 active:scale-90 transition-all duration-200"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={goNext}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 active:scale-90 transition-all duration-200"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {blogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-[2rem] border border-white/5">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No blogs published yet. Check back soon!</p>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${currentIndex}-${cardsPerPage}`}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
                center: { opacity: 1, x: 0 },
                exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -50 : 50 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`grid ${gridCols} gap-4 sm:gap-6`}
            >
              {visibleBlogs.map((blog, idx) => (
                <motion.div
                  key={`${blog.id}-${currentIndex}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.35 }}
                  className="group relative overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] bg-slate-900 border border-white/5 cursor-pointer"
                  style={{ aspectRatio: cardsPerPage === 1 ? '16/10' : '3/4' }}
                  onClick={() => navigate(`/blogs/${slugify(blog.title)}`)}
                >
                  {/* Image */}
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-baf-base/60 to-slate-900" />
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Category pill */}
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] bg-baf-cyan/20 border border-baf-cyan/40 text-baf-cyan px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-sm">
                      {blog.category}
                    </span>
                  </div>

                  {/* Content — always visible on mobile, hover on desktop */}
                  <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end z-10">
                    {blog.date && (
                      <span className="text-[9px] sm:text-[10px] text-baf-cyan font-black uppercase tracking-[0.15em] mb-2 sm:mb-3
                        sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-400 delay-75">
                        {blog.date}
                      </span>
                    )}
                    <h3 className="text-base sm:text-xl font-serif font-bold text-white leading-snug mb-2 sm:mb-4 sm:group-hover:-translate-y-1 transition-transform duration-400">
                      {blog.title}
                    </h3>
                    {blog.excerpt && (
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3
                        sm:opacity-0 sm:translate-y-3 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-400 delay-75 line-clamp-2">
                        {renderExcerpt(blog.excerpt, 100)}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-baf-cyan text-xs sm:text-sm font-semibold
                      sm:opacity-0 sm:translate-y-3 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-400 delay-100">
                      <span>Read more</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Page dots */}
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentPage ? 1 : -1);
                  setCurrentIndex(i * cardsPerPage);
                }}
                className="h-1.5 rounded-full transition-all duration-400"
                style={{
                  width: currentPage === i ? 28 : 8,
                  backgroundColor: currentPage === i ? '#25C1C8' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
