import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';

// Helper for animation rendering
function SponsorMarquee({ items }: { items: any[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex whitespace-nowrap outline-none animate-marquee-half w-max py-4">
      {[...items, ...items].map((sponsor, index) => (
        <div key={index} className="px-8 md:px-16 flex items-center justify-center opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 cursor-pointer hover:scale-110">
          <img src={sponsor.logo || undefined} alt={sponsor.name} className="h-12 md:h-14 w-auto object-contain mix-blend-screen" />
        </div>
      ))}
    </div>
  );
}

export function Sponsors() {
  const [sponsors, setSponsors] = useState<any[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'sponsors'), orderBy('createdAt', 'desc'))).then(snap => ({ data: snap.docs.map(d=>d.data()), error: null })).then(({ data, error }) => {
      if (!error && data) {
        setSponsors(data);
      }
    });
  }, []);

  return (
    <div className="w-full py-8 md:py-10 bg-slate-950 outline-none">
      <div className="max-w-4xl mx-auto bg-slate-900/30 overflow-hidden border border-white/10 py-6 rounded-3xl mx-4 md:mx-auto">
        <div className="text-center mb-4">
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">Trusted by Industry Leaders</p>
        </div>
        <SponsorMarquee items={sponsors} />
      </div>
    </div>
  );
}
