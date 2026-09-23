import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
const mainLogo = '/BAFSDBC_Logo_BG_removed.png';
import { useContactModal } from './ContactModalContext';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/events' },
  { name: 'Team', href: '/team' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'e-Cert', href: '/certificate' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { openModal } = useContactModal();

  useEffect(() => {
    // Close mobile menu on route change
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-center pt-6 px-4 pointer-events-none">
      <div 
        className={`pointer-events-auto w-full transition-all duration-300 ease-out bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl ${
          isScrolled ? 'max-w-5xl rounded-full' : 'max-w-6xl rounded-3xl'
        }`}
      >
        <div className="px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={mainLogo || undefined} alt="BAF Shaheen College Dhaka Business Club — BAFSDBC Official Logo" className="h-10 w-auto object-contain" />
              <span className="font-serif font-bold text-2xl tracking-tight text-white hidden sm:block">
                BAFSD<span className="text-baf-cyan group-hover:text-white transition-colors">BC</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium px-3 lg:px-4 py-2 text-sm rounded-full transition-all tracking-wide whitespace-nowrap ${
                  location.pathname === link.href 
                    ? 'text-baf-cyan bg-baf-cyan/10 border border-baf-cyan/20' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Button */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={openModal}
              className="inline-flex items-center justify-center px-8 py-2.5 text-sm font-bold rounded-full text-black bg-baf-cyan hover:bg-white transition-all shadow-lg shadow-baf-cyan/20 transform hover:scale-105 whitespace-nowrap"
            >
              JOIN NOW
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden overflow-hidden bg-slate-900/95 backdrop-blur-3xl rounded-b-3xl border-t border-white/5"
            >
              <div className="px-6 py-6 space-y-2 flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`block px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                      location.pathname === link.href
                        ? 'text-baf-cyan bg-baf-cyan/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4">
                  <button
                    onClick={() => { setIsOpen(false); openModal(); }}
                    className="flex w-full items-center justify-center px-6 py-4 text-base font-bold rounded-2xl text-black bg-baf-cyan hover:bg-white transition-all shadow-lg"
                  >
                    JOIN NOW
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
