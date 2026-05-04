"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function AnimatedPageWrapper({ 
  children, 
  title, 
  subtitle 
}: { 
  children: ReactNode; 
  title: string; 
  subtitle?: string; 
}) {
  return (
    <main className="relative min-h-screen px-4 py-24 md:py-32 overflow-hidden flex flex-col items-center">
      {/* Premium ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-3xl space-y-12">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 mb-4">
            {title}
          </h1>
          {subtitle && <p className="text-lg text-white/50">{subtitle}</p>}
        </motion.header>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="glass-card rounded-3xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Subtle inner highlights */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 space-y-10">
            {children}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export function AnimatedSection({ 
  title, 
  children, 
  delay = 0 
}: { 
  title: string; 
  children: ReactNode; 
  delay?: number; 
}) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className="space-y-4 group"
    >
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 inline-block relative">
        {title}
        <div className="absolute -bottom-1 left-0 w-0 h-px bg-blue-400/50 group-hover:w-full transition-all duration-500 ease-out" />
      </h2>
      <div className="text-white/70 leading-relaxed space-y-4 text-[15px] sm:text-base">
        {children}
      </div>
    </motion.section>
  );
}
