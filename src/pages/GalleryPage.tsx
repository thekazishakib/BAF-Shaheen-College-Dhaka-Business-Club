const img1 = "";
const img2 = "";
const img3 = "";
const img4 = "";
const img5 = "";
const img6 = "";
const img7 = "";
const img8 = "";
const img9 = "";

const img10 = "";
const img11 = "";
const img13 = "";
const img14 = "";
const img15 = "";
const img16 = "";
const img17 = "";
const img18 = "";
const img19 = "";
const img20 = "";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';

import { motion } from 'motion/react';

export default function GalleryPage() {
  const customImages = [
    img1, img2, img3, img4, img5, img6, img7, img8, img9,
    img10, img11, img13, img14, img15, img16, img17, img18, img19, img20
  ];
  
  // Create an array of 30 images to allow user to easily swap them out 
  const defaultGalleryImages: any[] = [];

  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))).then(snap => ({ data: snap.docs.map(d=>d.data()), error: null })).then(({ data, error }) => {
      if (!error && data) {
        setGalleryImages(data.map(d => ({ url: d.url, caption: d.caption })));
      }
    });
  }, []);

  return (
    <div className="pt-24 pb-32 bg-slate-950 text-white min-h-screen relative font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, var(--color-baf-base) 0%, transparent 50%), radial-gradient(circle at 80% 70%, var(--color-baf-cyan) 0%, transparent 50%)' }}></div>
      
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
            Gallery
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium tracking-wide"
          >
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="text-white">Gallery</span>
          </motion.div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((img, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden rounded-xl bg-slate-900 group">
              <img 
                src={img.url || undefined} 
                alt={img.caption || `Event highlight ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-medium text-white">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}