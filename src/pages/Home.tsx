import { motion } from 'motion/react';
import { Hero } from '../components/Hero';
import { Sponsors } from '../components/Sponsors';
import { ClubIncharge } from '../components/ClubIncharge';
import { About } from '../components/About';
import { Events } from '../components/Events';
import { Leadership } from '../components/Leadership';
import { Gallery } from '../components/Gallery';
import { TestimonialSlider } from '../components/TestimonialSlider';
import { BlogSlider } from '../components/BlogSlider';
import { FAQ } from '../components/FAQ';

export default function Home() {
  return (
    <>
      <Hero />
      <Sponsors />
      <ClubIncharge />
      <About />
      <Events limit={3} />
      <Leadership limit={4} />
      <section className="py-24 bg-slate-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Event <span className="text-baf-cyan italic">Gallery</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-baf-base to-baf-cyan mx-auto rounded-full mb-6"></div>
            <p className="text-gray-400 font-medium">A visual journey of our impactful events and activities.</p>
          </motion.div>
        </div>
        <div className="w-full relative z-10">
          <Gallery />
        </div>
      </section>
      <TestimonialSlider />
      <BlogSlider />
      <FAQ />
    </>
  );
}
