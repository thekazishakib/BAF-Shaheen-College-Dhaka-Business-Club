import React from 'react';

export function RouteSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white pt-32 pb-24 font-sans relative overflow-hidden animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-baf-cyan/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Hero Section Skeleton */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
          <div className="h-6 w-32 bg-white/5 border border-white/10 rounded-full animate-pulse" />
          <div className="h-12 w-3/4 sm:w-2/3 bg-white/10 rounded-2xl animate-pulse" />
          <div className="h-4 w-1/3 bg-white/5 rounded-full animate-pulse" />
        </div>

        {/* Content Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
          
          {/* Main Content Side/Block */}
          <div className="lg:col-span-2 space-y-8 bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 sm:p-10 backdrop-blur-xl">
            <div className="h-6 w-1/4 bg-baf-cyan/20 rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-white/5 rounded-full animate-pulse" />
              <div className="h-4 w-11/12 bg-white/5 rounded-full animate-pulse" />
              <div className="h-4 w-4/5 bg-white/5 rounded-full animate-pulse" />
            </div>
            
            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="h-6 w-1/3 bg-white/10 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
                <div className="h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sidebar Block */}
          <div className="space-y-8 bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
            <div className="h-6 w-1/2 bg-white/10 rounded-lg animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse flex-shrink-0" />
                  <div className="flex-grow space-y-2">
                    <div className="h-3 w-1/2 bg-white/10 rounded-full animate-pulse" />
                    <div className="h-2 w-3/4 bg-white/5 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
