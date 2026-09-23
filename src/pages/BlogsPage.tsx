import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Check } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { renderExcerpt } from '../lib/renderExcerpt';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function BlogsPage() {
  const navigate = useNavigate();
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [fetchedBlogs, setFetchedBlogs] = useState<any[]>([]);

  const parseDateMs = (dateStr: string, createdAt: any): number => {
    if (dateStr) {
      const clean = dateStr.replace(/(\d+)(st|nd|rd|th)/i, '$1');
      const ms = new Date(clean).getTime();
      if (!isNaN(ms)) return ms;
    }
    if (createdAt?.toDate) return createdAt.toDate().getTime();
    if (typeof createdAt === 'number') return createdAt;
    return 0;
  };

  useEffect(() => {
    getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))).then(snap => ({ data: snap.docs.map(d=>d.data()), error: null })).then(({ data, error }) => {
      if (!error && data) {
        const mapped = data.map(d => ({
          title: d.title,
          date: d.date
            ? new Date(d.date.replace(/(\d+)(st|nd|rd|th)/i, '$1')).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date(d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          _sortMs: parseDateMs(d.date, d.createdAt),
          author: d.author,
          excerpt: d.excerpt || d.content || '',
          image: d.image,
          content: <div className="space-y-6 text-gray-300 whitespace-pre-wrap">{d.content}</div>
        }));
        mapped.sort((a, b) => b._sortMs - a._sortMs);
        setFetchedBlogs(mapped);
      }
    });
  }, []);

  const displayBlogs = fetchedBlogs;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedBlog?.title,
        text: selectedBlog?.excerpt,
        url: window.location.href,
      }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="pt-24 pb-32 bg-slate-950 text-white min-h-screen relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, var(--color-baf-base), transparent 70%)' }}></div>
      
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
            BAFSDBC Blog & Business Insights
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium tracking-wide"
          >
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-white">Blog & Insights</span>
          </motion.div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pt-0">
          {fetchedBlogs.length === 0 ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden animate-pulse">
                <div className="h-64 bg-white/5" />
                <div className="p-10 space-y-4">
                  <div className="h-3 w-1/3 bg-white/10 rounded-full" />
                  <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-white/5 rounded-full" />
                    <div className="h-4 w-5/6 bg-white/5 rounded-full" />
                  </div>
                  <div className="pt-4 h-4 w-1/4 bg-baf-cyan/20 rounded-full" />
                </div>
              </div>
            ))
          ) : (
            displayBlogs.map((blog, index) => (
              <motion.article 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-baf-cyan/30 transition-all group shadow-2xl shadow-black/50 cursor-pointer"
                onClick={() => navigate(`/blogs/${slugify(blog.title)}`)}
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={blog.image || undefined} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/20"></div>
                  <div className="absolute top-6 left-6">
                     <div className="bg-baf-cyan text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{blog.author.split(' ')[0]}</div>
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex items-center text-xs text-baf-cyan font-bold uppercase tracking-[0.2em] mb-6 opacity-60">
                    <span>{blog.date}</span>
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-4 text-white group-hover:text-baf-cyan transition-colors leading-tight italic">{blog.title}</h2>
                  <p className="text-gray-400 text-base font-medium line-clamp-3 mb-8 leading-relaxed">{renderExcerpt(blog.excerpt, 100)}</p>
                  <div className="text-white font-black text-xs uppercase tracking-[0.3em] flex items-center group-hover:text-baf-cyan transition-colors">
                    Read Article <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedBlog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <div className="bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black transition-colors" onClick={handleShare} title="Share">
                   {isCopied ? <Check className="w-6 h-6 text-green-400" /> : <Share2 className="w-6 h-6 text-white" />}
                </div>
                <div className="bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black transition-colors" onClick={() => setSelectedBlog(null)} title="Close">
                   <X className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="h-64 md:h-80 relative shrink-0">
                <img src={selectedBlog.image || undefined} alt={selectedBlog.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 pr-6">
                   <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">{selectedBlog.title}</h2>
                   <div className="flex gap-4 text-sm font-medium text-gray-300">
                     <span>By {selectedBlog.author}</span>
                     <span>&bull;</span>
                     <span>{selectedBlog.date}</span>
                   </div>
                </div>
              </div>
              <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
                {selectedBlog.content}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
