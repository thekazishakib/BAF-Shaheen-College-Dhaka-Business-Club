import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
const img1 = "";
const img2 = "";
const img3 = "";
const img4 = "";
const img5 = "";
const img6 = "";
const img7 = "";
const img8 = "";
const img9 = "";

const defaultImages = [];

export function Gallery() {
  const [images, setImages] = useState<string[]>(defaultImages);

  useEffect(() => {
    getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))).then((snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      const error = null;
      if (!error && data && data.length > 0) {
        setImages(data.map(d => d.url));
      } else if (!error && data && data.length === 0) {
        setImages([]);
      }
    });
  }, []);

  if (images.length === 0) return null;

  return (
    <div id="gallery" className="mb-24 overflow-hidden relative">
      <div className="flex flex-col gap-4">
        {/* Row 1: Left */}
        <div className="flex w-max animate-marquee-half" style={{ animationDuration: '400s' }}>
          {[...images, ...images, ...images, ...images].map((img, idx) => (
            <div key={`r1-${idx}`} className="w-[280px] md:w-[400px] xl:w-[480px] h-[200px] md:h-[280px] xl:h-[320px] flex-shrink-0 mx-2 relative overflow-hidden rounded-2xl md:rounded-[2rem] group border border-white/5">
              <img 
                src={img || undefined} 
                alt={`Gallery image ${idx + 1}`} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
              />
            </div>
          ))}
        </div>
        
        {/* Row 2: Right */}
        <div className="flex w-max animate-marquee-half" style={{ animationDirection: 'reverse', animationDuration: '500s' }}>
          {[...images.slice().reverse(), ...images.slice().reverse(), ...images.slice().reverse(), ...images.slice().reverse()].map((img, idx) => (
            <div key={`r2-${idx}`} className="w-[280px] md:w-[400px] xl:w-[480px] h-[200px] md:h-[280px] xl:h-[320px] flex-shrink-0 mx-2 relative overflow-hidden rounded-2xl md:rounded-[2rem] group border border-white/5">
              <img 
                src={img || undefined} 
                alt={`Gallery image ${idx + 1}`} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
              />
            </div>
          ))}
        </div>

        {/* Row 3: Left */}
        <div className="flex w-max animate-marquee-half" style={{ animationDuration: '450s' }}>
          {[...images.slice(3).concat(images.slice(0, 3)), ...images.slice(3).concat(images.slice(0, 3)), ...images.slice(3).concat(images.slice(0, 3)), ...images.slice(3).concat(images.slice(0, 3))].map((img, idx) => (
            <div key={`r3-${idx}`} className="w-[280px] md:w-[400px] xl:w-[480px] h-[200px] md:h-[280px] xl:h-[320px] flex-shrink-0 mx-2 relative overflow-hidden rounded-2xl md:rounded-[2rem] group border border-white/5">
              <img 
                src={img || undefined} 
                alt={`Gallery image ${idx + 1}`} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Edge Gradients */}
      <div className="absolute inset-x-0 top-0 bottom-32 pointer-events-none z-10">
        <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-slate-950 to-transparent"></div>
        <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-slate-950 to-transparent"></div>
      </div>

      <div className="text-center mt-12 relative z-20">
        <button className="px-10 py-4 bg-white/5 hover:bg-baf-cyan hover:text-black text-white rounded-full transition-all border border-white/10 font-bold uppercase tracking-widest text-xs">
          Explore the Memories
        </button>
      </div>
    </div>
  );
}
