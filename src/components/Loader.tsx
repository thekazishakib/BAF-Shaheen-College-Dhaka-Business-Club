import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

const loadingWords = [
  "SYSTEM INITIATED",
  "SYNERGIZING DATA",
  "RENDERING INTERFACE",
  "IGNITING PASSION",
  "WELCOME TO BAFSDBC"
];

export function Loader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const duration = 3000; 
    const intervalTime = 30; 
    const increment = 100 / (duration / intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + increment;
      });
    }, intervalTime);

    const wordInterval = setInterval(() => {
       setWordIndex((prev) => Math.min(prev + 1, loadingWords.length - 1));
    }, duration / loadingWords.length);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3600); 

    return () => {
      clearInterval(progressInterval);
      clearInterval(wordInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Cascade Curtain 2 */}
          <motion.div
            key="loader-bg-2"
            exit={{ y: "-100%", transition: { duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.15 } }}
            className="fixed inset-0 z-[98] bg-baf-cyan pointer-events-none"
          />
          {/* Cascade Curtain 1 */}
          <motion.div
            key="loader-bg-1"
            exit={{ y: "-100%", transition: { duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.08 } }}
            className="fixed inset-0 z-[99] bg-[#0B3D91] pointer-events-none"
          />
          {/* Main Loader */}
          <motion.div
            key="loader-content"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] overflow-hidden"
            exit={{ 
              y: "-100%", 
              transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } 
            }}
          >
            {/* Abstract Background Elements */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#0B3D91] blur-[150px] rounded-full pointer-events-none"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.05, 0.1, 0.05]
              }}
              transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-baf-cyan blur-[120px] rounded-full pointer-events-none"
            />

            <div className="relative z-10 flex flex-col items-center w-full max-w-5xl px-4">
              
              {/* Dynamic Word */}
              <div className="h-6 relative overflow-hidden flex justify-center w-full text-center mb-10">
                <AnimatePresence>
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0, position: 'absolute' }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="text-white/60 text-[10px] md:text-sm tracking-[0.4em] md:tracking-[0.6em] font-medium absolute uppercase"
                  >
                    {loadingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* The heavy lifting text */}
              <div className="relative inline-block text-6xl md:text-8xl lg:text-[10rem] font-serif font-black tracking-widest uppercase text-center">
                <div className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
                  BAF<span className="italic pr-2 md:pr-4 text-transparent">SDBC</span>
                </div>
                
                {/* The filled text overlay */}
                <motion.div 
                  className="absolute top-0 left-0 bottom-0 overflow-hidden text-transparent bg-clip-text bg-gradient-to-r from-baf-cyan via-white to-[#0B3D91] whitespace-nowrap"
                  style={{ 
                    width: `${Math.min(progress, 100)}%`,
                    WebkitTextStroke: '0px'
                  }}
                >
                  BAF<span className="italic pr-2 md:pr-4 text-transparent">SDBC</span>
                </motion.div>
              </div>

              {/* Empty space for layout balance if needed, or just removed */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

