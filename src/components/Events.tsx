import { Calendar, Clock, MapPin, UserSquare, Share2, Check } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { sanitizeUrl } from '../lib/sanitizeUrl';
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
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';

export function Events({ hideTitleAndButton = false, limit }: { hideTitleAndButton?: boolean; limit?: number }) {
  const [fetchedEvents, setFetchedEvents] = useState<any[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'events'), orderBy('createdAt', 'desc'))).then(snap => ({ data: snap.docs.map(d=>d.data()), error: null })).then(({ data, error }) => {
      if (!error && data) {
        const mapped = data.map(d => ({
          id: d.id,
          title: d.title,
          type: d.type || "EVENT",
          date: d.date,
          time: d.time,
          venue: d.venue,
          image: d.image,
          speaker: d.speaker || null,
          registrationLink: d.registrationLink || null,
          createdAt: d.createdAt
        }));
        setFetchedEvents(mapped);

        // Inject Event schema (ItemList of events)
        const existing = document.getElementById('events-ld');
        if (existing) existing.remove();
        if (mapped.length > 0) {
          // Helper: parse "15th March 2025" or "March 15, 2025" → ISO 8601
          const toISO = (dateStr: string, timeStr?: string): string => {
            if (!dateStr) return new Date().toISOString();
            const clean = dateStr.replace(/(\d+)(st|nd|rd|th)/i, '$1');
            const d = new Date(clean);
            if (isNaN(d.getTime())) return new Date().toISOString();
            if (timeStr) {
              const [h, m] = timeStr.replace(/[APap][Mm]/, '').trim().split(':');
              const isPM = /pm/i.test(timeStr);
              let hours = parseInt(h || '0');
              if (isPM && hours !== 12) hours += 12;
              if (!isPM && hours === 12) hours = 0;
              d.setHours(hours, parseInt(m || '0'), 0);
            }
            return d.toISOString();
          };

          const script = document.createElement('script');
          script.id = 'events-ld';
          script.type = 'application/ld+json';
          script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "BAFSDBC Events & Workshops",
            "description": "Workshops, seminars, and business competitions organized by BAF Shaheen College Dhaka Business Club.",
            "url": "https://bafsdbc.vercel.app/events",
            "itemListElement": mapped.slice(0, 10).map((ev, i) => {
              const startISO = toISO(ev.date, ev.time);
              const endDate = new Date(new Date(startISO).getTime() + 3 * 60 * 60 * 1000); // +3 hours default

              const eventItem: any = {
                "@type": "Event",
                "name": ev.title,
                "description": `${ev.type} organized by BAF Shaheen College Dhaka Business Club (BAFSDBC)`,
                "image": (ev.image && !ev.image.startsWith('data:')) ? ev.image : "https://bafsdbc.vercel.app/og-image.jpg",
                "url": "https://bafsdbc.vercel.app/events",
                "startDate": startISO,
                "endDate": endDate.toISOString(),
                "eventStatus": "https://schema.org/EventScheduled",
                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                "location": {
                  "@type": "Place",
                  "name": ev.venue || "BAF Shaheen College Dhaka",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Dhaka",
                    "addressCountry": "BD"
                  }
                },
                "organizer": {
                  "@type": "Organization",
                  "name": "BAF Shaheen College Dhaka Business Club",
                  "url": "https://bafsdbc.vercel.app/"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "BDT",
                  "availability": "https://schema.org/InStock",
                  "url": (ev.registrationLink && ev.registrationLink.startsWith('http')) ? ev.registrationLink : "https://bafsdbc.vercel.app/events",
                  "validFrom": startISO
                }
              };

              // Add performer — use speaker if available, otherwise fallback to organizer
              eventItem["performer"] = ev.speaker
                ? { "@type": "Person", "name": ev.speaker }
                : { "@type": "Organization", "name": "BAF Shaheen College Dhaka Business Club" };

              return {
                "@type": "ListItem",
                "position": i + 1,
                "item": eventItem
              };
            })
          });
          document.head.appendChild(script);
        }
      }
    });

    return () => {
      const el = document.getElementById('events-ld');
      if (el) el.remove();
    };
  }, []);

  const parseDate = (dateStr: string) => {
    if(!dateStr) return 0;
    const cleanDate = dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
    return new Date(cleanDate).getTime() || 0;
  };

  const sortedEvents = [...fetchedEvents].sort((a, b) => parseDate(b.date) - parseDate(a.date));

  const events = limit ? sortedEvents.slice(0, limit) : sortedEvents;

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (event: any) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Join us for ${event.title} on ${event.date}!`,
        url: window.location.href,
      }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const isUpcoming = (dateStr: string) => parseDate(dateStr) >= Date.now();

  return (
    <section id="events" className={`${hideTitleAndButton ? 'pb-32' : 'py-32'} bg-slate-950 relative`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!hideTitleAndButton && (
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-12 bg-baf-cyan"></div>
                <span className="text-white font-bold tracking-[0.2em] uppercase text-sm">EVENTS & WORKSHOPS</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-sans text-white mb-2 tracking-tight leading-tight">
                Discover our <span className="text-transparent bg-clip-text bg-gradient-to-r from-baf-cyan to-indigo-400">latest activities</span>
              </h2>
            </div>
            <Link to="/events" className="text-baf-cyan font-bold flex items-center group shrink-0 mb-4">
              View All Events <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {fetchedEvents.length === 0 ? (
            Array.from({ length: limit || 3 }).map((_, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-10 space-y-6 animate-pulse">
                <div className="h-48 bg-white/5 rounded-2xl" />
                <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
                <div className="space-y-4 pt-4">
                  <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                  <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                  <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                </div>
                <div className="pt-6 flex gap-4">
                  <div className="h-10 w-24 bg-white/10 rounded-full" />
                  <div className="h-10 w-10 bg-white/5 rounded-full" />
                </div>
              </div>
            ))
          ) : (
            events.map((event) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="group bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-baf-cyan/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,240,255,0.15)] transition-all duration-500 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden shrink-0">
                  <div className="absolute top-6 left-6 z-10 px-4 py-1.5 bg-baf-base rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    {event.type}
                  </div>
                  <img 
                    src={event.image || undefined} 
                    alt={event.title} 
                    className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <h4 className="text-2xl font-serif text-white mb-8 line-clamp-2 min-h-[64px] group-hover:text-baf-cyan transition-colors">{event.title}</h4>
                  <div className="space-y-5 flex-1">
                    <div className="flex items-center gap-4 text-gray-400">
                      <Calendar className="w-5 h-5 text-baf-base" />
                      <span className="text-sm font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                      <Clock className="w-5 h-5 text-baf-base" />
                      <span className="text-sm font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                      <MapPin className="w-5 h-5 text-baf-base shrink-0" />
                      <span className="text-sm font-medium truncate">{event.venue}</span>
                    </div>
                    {event.speaker && (
                      <div className="flex items-center gap-4 text-gray-400">
                        <UserSquare className="w-5 h-5 text-baf-base shrink-0" />
                        <span className="text-sm font-medium truncate text-baf-cyan">{event.speaker}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-8 flex gap-4 mt-auto">
                    {isUpcoming(event.date) ? (
                      event.registrationLink ? (
                        <a 
                          href={sanitizeUrl(event.registrationLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-baf-cyan text-slate-950 flex items-center justify-center font-bold py-3 px-6 rounded-xl hover:bg-white transition-colors group-hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                        >
                          Register Now
                        </a>
                      ) : (
                        <button 
                          onClick={() => alert("Registration will open soon!")}
                          className="flex-1 bg-baf-cyan text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-white transition-colors group-hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                        >
                          Register Now
                        </button>
                      )
                    ) : (
                      <button disabled className="flex-1 bg-white/5 border border-white/10 text-gray-500 font-bold py-3 px-6 rounded-xl cursor-not-allowed">
                        Closed
                      </button>
                    )}
                    <button 
                      onClick={() => handleShare(event)}
                      className="w-12 h-12 flex items-center justify-center shrink-0 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group-hover:text-baf-cyan text-gray-400"
                      title="Share Event"
                    >
                      {copiedId === event.id ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

import { motion } from 'motion/react';
