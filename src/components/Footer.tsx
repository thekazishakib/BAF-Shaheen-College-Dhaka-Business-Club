import React from 'react';
import { Mail, Facebook, Linkedin, Youtube, Instagram, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import footerLogo from '../../public/BAFSDBC_Logo_BG_removed.png';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-32 pb-16 relative overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-baf-cyan/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-4 mb-8 group">
              <img src={footerLogo || undefined} alt="BAF Shaheen College Dhaka Business Club — BAFSDBC Official Logo" className="h-12 w-auto object-contain rounded-full" />
              <span className="font-serif font-black text-3xl tracking-tighter text-white">
                BAFSD<span className="text-baf-cyan">BC</span>
              </span>
            </Link>
            <p className="text-gray-400 text-base leading-relaxed mb-8 font-medium">
              Empowering Youth Leadership, Building Future Pioneers. The premier platform for ambitious students to excel in the global corporate landscape.
            </p>
            <div className="flex gap-4">
               {/* Social Icons with refined style */}
               {[
                 { Icon: Facebook, url: "https://www.facebook.com/bafsdbc" },
                 { Icon: Linkedin, url: "https://www.linkedin.com/company/baf-shaheen-college-dhaka-business-club/" },
                 { Icon: Instagram, url: "https://www.instagram.com/bafsdbc.official" },
                 { Icon: Youtube, url: "https://www.youtube.com/@bafshaheencollegedhakabusi8584" }
               ].map(({ Icon, url }, idx) => (
                 <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-baf-cyan hover:text-black hover:scale-110 transition-all">
                   <Icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-8 tracking-widest text-white uppercase text-xs">Quick Navigation</h4>
            <ul className="space-y-4">
              {['Home', 'About', 'Events', 'Team', 'Gallery', 'Blogs', 'Certificate'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : item === 'Certificate' ? '/certificate' : `/${item.toLowerCase()}`} 
                    className="text-gray-400 hover:text-baf-cyan transition-all text-base font-medium flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-baf-cyan mr-0 group-hover:mr-2 transition-all"></span>
                    {item === 'Certificate' ? 'e-Cert' : item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-8 tracking-widest text-white uppercase text-xs">Official Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-gray-400">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Mail className="w-5 h-5 text-baf-cyan" />
                </div>
                <div>
                  <div className="text-xs text-white/30 uppercase tracking-widest mb-1 italic">Email Us</div>
                  <a href="mailto:businessclub.bafsd@gmail.com" className="hover:text-baf-cyan transition-colors font-medium">
                    businessclub.bafsd@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 text-gray-400">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <MapPin className="w-5 h-5 text-baf-cyan" />
                </div>
                <div>
                  <div className="text-xs text-white/30 uppercase tracking-widest mb-1 italic">Location</div>
                  <span className="font-medium leading-relaxed">
                    BAF Shaheen College Dhaka<br/>
                    Dhaka-1206, Bangladesh
                  </span>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl">
            <h4 className="font-bold text-white mb-4">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-6">Stay updated with our latest events and insights.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-sm focus:outline-none focus:border-baf-cyan transition-colors"
              />
              <button className="absolute right-2 top-1.5 bg-baf-cyan text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white transition-colors">
                SEND
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-white/20 text-sm font-medium tracking-wide">
              &copy; {new Date().getFullYear()} BAFSD BUSINESS CLUB. DESIGNED FOR EXCELLENCE.
            </p>
            <p className="text-white/30 text-xs font-medium tracking-wide mt-1">
              Developed by <span className="text-white font-semibold">Kazi Shakib</span>
              <span className="mx-3 text-white/10">|</span>
              <a href="https://www.linkedin.com/in/kazishakib/" target="_blank" rel="noopener noreferrer" className="hover:text-baf-cyan transition-colors">LinkedIn</a>
              <span className="mx-3 text-white/10">|</span>
              <a href="https://kazishakib.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-baf-cyan transition-colors">Portfolio</a>
            </p>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em] text-white/20">
            <Link to="/privacy" className="hover:text-baf-cyan transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-baf-cyan transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
