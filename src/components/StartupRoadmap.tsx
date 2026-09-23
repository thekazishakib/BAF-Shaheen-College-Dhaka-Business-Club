import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  Search, 
  Tag, 
  UserCheck, 
  LayoutGrid, 
  Hammer, 
  Rocket, 
  Presentation, 
  TrendingUp,
  Compass,
  Lightbulb,
  FileText,
  Crown,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';

const roadmapSteps = [
  {
    id: 1,
    title: "Zero: Founder Awakening",
    subtitle: "From consumer to builder",
    description: "Shift your mindset. Observe daily inefficiencies, study startup case studies, and build 'problem awareness'. Real founders notice what's broken.",
    icon: Compass,
  },
  {
    id: 2,
    title: "Idea",
    subtitle: "Find a real problem worth solving",
    description: "Fall in love with the problem, not the solution. Learn problem-first entrepreneurship, opportunity mapping, and founder-market fit.",
    icon: Lightbulb,
  },
  {
    id: 3,
    title: "Validation",
    subtitle: "Prove real demand before building",
    description: "Assumptions are dangerous until tested. Conduct 20+ customer discovery interviews, run surveys, and create waitlists to test product-market fit.",
    icon: Search,
  },
  {
    id: 4,
    title: "Business Model",
    subtitle: "Design a sustainable business",
    description: "Great products die from weak economics. Use the Lean Canvas to design revenue streams, pricing strategy, and unit economics.",
    icon: FileText,
  },
  {
    id: 5,
    title: "MVP Development",
    subtitle: "Build the simplest testable version",
    description: "Build fast. Learn faster. Use no-code tools and rapid prototyping to create a minimum viable product and record a demo video.",
    icon: Hammer,
  },
  {
    id: 6,
    title: "Launch",
    subtitle: "Get your first real users",
    description: "Distribution matters. Execute a go-to-market strategy, target early adopters, run social campaigns, and focus on customer onboarding.",
    icon: Rocket,
  },
  {
    id: 7,
    title: "Pitch & Funding",
    subtitle: "Communicate clearly and effectively",
    description: "Investors back clarity and execution. Learn pitch storytelling, traction metrics, market sizing, and financial forecasting for Demo Day.",
    icon: Presentation,
  },
  {
    id: 8,
    title: "Growth",
    subtitle: "Scale sustainably",
    description: "Growth without systems creates chaos. Focus on retention, growth loops, team building, startup operations, and preventing founder burnout.",
    icon: TrendingUp,
  },
  {
    id: 9,
    title: "Hero",
    subtitle: "Execution-focused entrepreneur",
    description: "You have a validated startup, an MVP, traction, and the discipline to continue. Continuous learning and customer obsession define the Hero.",
    icon: Crown,
  }
];

const realityChecks = [
  { title: "Most Startups Fail", content: "Usually not because founders aren't smart, but due to no market need, poor timing, or weak distribution." },
  { title: "Ideas Are Cheap", content: "Execution matters. Thousands of people have ideas. Few validate properly, build consistently, and survive." },
  { title: "Validation Before Coding", content: "Many founders waste months building products nobody wants. Customer discovery reduces this risk." },
  { title: "Consistency Wins", content: "Not intelligence alone. Not motivation alone. Consistent execution compounds." },
];

export function StartupRoadmap() {
  return (
    <div className="relative py-24 w-full">
      {/* Overview Section */}
      <div className="text-center mb-24 max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight font-serif">
          How to Start a Startup: <span className="text-[#25C1C8]">Zero to Hero</span>
        </h2>
        <p className="text-sm md:text-lg font-bold tracking-widest text-slate-300 uppercase mb-8">
          A Practical Startup Accelerator Curriculum for Beginners
        </p>
        <p className="text-gray-400 text-base md:text-xl leading-relaxed mb-6 glass-panel p-8 rounded-2xl relative">
          Most students are taught how to get jobs. Very few are taught how to build companies. 
          This curriculum is an execution-focused, reality-based accelerator designed to teach you how real startups are built — from discovering customer problems to launching MVPs, acquiring users, pitching investors, and scaling sustainably.
          
          <span className="block mt-6 text-sm text-[#25C1C8] font-bold tracking-wider uppercase border-t border-white/10 pt-4">Curated by Kazi Shakib</span>
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* The 9-Step Roadmap */}
        <div className="mb-16 text-center">
          <h3 className="text-3xl font-bold text-white mb-2">The Startup Journey Roadmap</h3>
          <p className="text-[#25C1C8]">From Zero to Idea, MVP to Hero.</p>
        </div>

        {/* Vertical Line */}
        <div className="absolute left-4 md:left-1/2 top-80 bottom-40 w-1 bg-white/5 -ml-[0.5px] md:-translate-x-1/2 rounded-full hidden sm:block"></div>

        <div className="space-y-12 sm:space-y-24 relative">
          {roadmapSteps.map((step, index) => {
            const isEven = index % 2 === 0;
            const Icon = step.icon;

            return (
              <div key={step.id} className={`relative flex flex-col sm:flex-row items-center w-full ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                
                {/* Timeline dot & icon */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="absolute left-4 sm:left-1/2 -ml-6 sm:-ml-8 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-950 border-4 border-[#25C1C8] flex items-center justify-center z-10 shadow-[0_0_20px_rgba(37,193,200,0.3)] hidden sm:flex"
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#25C1C8]" />
                </motion.div>

                {/* Content Card */}
                <div className={`w-full sm:w-1/2 flex ${isEven ? 'sm:pr-16 md:pr-24 justify-end' : 'sm:pl-16 md:pl-24 justify-start'}`}>
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -40 : 40, y: 10 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                    className="w-full bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-[#25C1C8]/40 transition-all duration-300 relative group"
                  >
                    {/* Mobile icon inside card */}
                    <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-[#25C1C8] flex items-center justify-center mb-4 sm:hidden">
                       <Icon className="w-5 h-5 text-[#25C1C8]" />
                    </div>

                    <div className="absolute -top-4 -right-4 sm:-right-6 text-7xl sm:text-[120px] font-bold text-white/10 pointer-events-none group-hover:text-[#25C1C8]/20 transition-colors duration-300">
                      0{step.id}
                    </div>
                    
                    <h4 className="text-2xl font-bold text-white mb-2 relative z-10">{step.title}</h4>
                    <p className="text-sm font-bold tracking-wider text-[#25C1C8] mb-4 relative z-10">{step.subtitle}</p>
                    <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                      {step.description}
                    </p>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Founder Execution Challenge */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Founder Execution Challenge</h3>
            <p className="text-[#25C1C8] max-w-2xl mx-auto">Your First 30 Days. Stop waiting. Start building. 30-Day Founder Rules: Talk to users every week, build small before building big, track real behavior, and remember that execution beats ideas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { week: 1, title: "Problem Discovery", tasks: ["Write 50 daily frustrations", "Observe inefficiencies", "Identify 10 recurring pain points"] },
              { week: 2, title: "Customer Discovery", tasks: ["Interview 20 people", "Ask about problems, not solutions", "Document repeated patterns"] },
              { week: 3, title: "Validation", tasks: ["Create landing page", "Run survey", "Test demand with signups"] },
              { week: 4, title: "MVP & Launch", tasks: ["Build simple prototype", "Launch publicly", "Collect feedback & iterate"] },
            ].map((week) => (
              <motion.div 
                key={week.week}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: week.week * 0.1 }}
                className="bg-slate-900/50 border border-[#25C1C8]/20 rounded-2xl p-6 relative"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#25C1C8] rounded-xl flex items-center justify-center text-slate-950 font-bold rotate-[-6deg]">
                  W{week.week}
                </div>
                <h4 className="text-xl font-bold text-white mt-2 mb-4">{week.title}</h4>
                <ul className="space-y-3">
                  {week.tasks.map((task, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-300">
                      <Target className="w-4 h-4 text-[#25C1C8] mr-2 shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reality Check Section */}
        <div className="mt-32 glass-panel rounded-3xl p-8 md:p-12 border-red-500/10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="md:w-1/3 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-400 mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Hard Truths</h3>
              <p className="text-gray-400 text-sm">
                What nobody tells beginner founders. The startup culture online is often fake. Real startups evolve through testing, failure, and iteration.
              </p>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {realityChecks.map((check, idx) => (
                <div key={idx} className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                  <h4 className="text-lg font-bold text-red-300 mb-2">{check.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{check.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
