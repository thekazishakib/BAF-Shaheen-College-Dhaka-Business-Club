import { Target, Eye, Users } from 'lucide-react';
import { motion } from 'motion/react';

export function About() {
  return (
    <section id="about" className="py-32 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-serif text-white mb-8"
          >
            About <span className="text-baf-cyan italic">BAFSDBC</span>
          </motion.h2>
          <p className="text-lg text-gray-400 font-medium">
            BAF Shaheen College Dhaka Business Club (BAFSDBC) is the premier student organization dedicated to developing the next generation of business leaders through practical experience, leadership programs, and professional networking.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Mission */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-xl p-12 rounded-[3rem] border border-white/5 group hover:border-baf-cyan/20 transition-all duration-500"
          >
            <div className="w-16 h-16 mb-8 text-baf-cyan group-hover:scale-110 transition-transform">
              <Target className="w-full h-full stroke-[1.5]" />
            </div>
            <h3 className="text-4xl font-serif text-white mb-6">Our Mission</h3>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Our mission is to empower students through leadership and innovation, providing them with the practical skills needed to succeed in the modern business world.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 backdrop-blur-xl p-12 rounded-[3rem] border border-white/5 group hover:border-baf-base/20 transition-all duration-500"
          >
            <div className="w-16 h-16 mb-8 text-baf-base group-hover:scale-110 transition-transform">
              <Eye className="w-full h-full stroke-[1.5]" />
            </div>
            <h3 className="text-4xl font-serif text-white mb-6">Our Vision</h3>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              We envision a network of empowered individuals who not only excel in their careers but also contribute meaningfully to society through ethical business practices.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
