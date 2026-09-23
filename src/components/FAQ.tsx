import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { injectSchema, removeSchema } from '../lib/schemaUtils';

const defaultFaqs = [];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<any[]>(defaultFaqs);

  useEffect(() => {
    getDocs(query(collection(db, 'faqs'), orderBy('createdAt', 'desc'))).then((snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      if (data && data.length > 0) {
        setFaqs(data);

        // Inject FAQPage schema for rich results
        injectSchema('faqpage-ld', {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question || faq.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer || faq.a
            }
          }))
        });
      }
    });

    return () => {
      removeSchema('faqpage-ld');
    };
  }, []);

  return (
    <section id="faq" className="py-32 bg-slate-950 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-white mb-6"
          >
            Frequently Asked <span className="text-baf-cyan italic">Questions</span>
          </motion.h2>
          <div className="w-16 h-1 bg-baf-cyan mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border transition-all duration-500 overflow-hidden ${openIdx === idx ? 'bg-slate-900 border-baf-cyan/30 shadow-2xl shadow-baf-cyan/5' : 'bg-slate-900/40 border-white/5 hover:border-white/20'}`}
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none group"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <span className={`font-serif text-lg md:text-xl transition-colors ${openIdx === idx ? 'text-baf-cyan' : 'text-white'}`}>{faq.question || faq.q}</span>
                <div className={`p-2 rounded-full transition-all duration-300 ${openIdx === idx ? 'bg-baf-cyan text-black rotate-180' : 'bg-white/5 text-white'}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-8 pb-8 text-gray-400 leading-relaxed text-lg font-medium">
                      {faq.answer || faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
