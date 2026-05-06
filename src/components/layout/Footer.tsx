"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
const Sparkles = (props: any) => <svg {...props}></svg>;
const Search = (props: any) => <svg {...props}></svg>;
const Globe = (props: any) => <svg {...props}></svg>;
const Clock = (props: any) => <svg {...props}></svg>;
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail("");
  };

  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <footer className="w-full relative z-10 border-t border-white/[0.04] bg-[#050a14] pt-16 pb-8 text-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8 mb-16">
        
        {/* Col 1: Brand & Tagline */}
        <div className="col-span-1 flex flex-col items-start space-y-6">
          <Link href="/" className="flex items-center gap-2 group">
             <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 p-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-105">
               <Sparkles className="h-5 w-5 text-white" />
             </div>
             <span className="font-display text-xl font-black italic tracking-wide text-white">
               SnowSense™
             </span>
          </Link>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-[240px]">
            The most accurate snow day prediction engine, powered by real-time weather data.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
              <Search className="h-5 w-5" />
            </a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Col 2: Predictions */}
        <div className="col-span-1 flex flex-col space-y-5">
           <h4 className="font-display font-bold uppercase tracking-widest text-zinc-300 text-sm">
             Predictions
           </h4>
           <nav className="flex flex-col space-y-3">
             <Link href="/prediction?loc=new-york" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">New York, NY</Link>
             <Link href="/prediction?loc=boston" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Boston, MA</Link>
             <Link href="/prediction?loc=chicago" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Chicago, IL</Link>
             <Link href="/prediction?loc=denver" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Denver, CO</Link>
             <Link href="/snow-day-calculator" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 font-bold text-blue-400">All Cities →</Link>
           </nav>
        </div>

        {/* Col 3: Resources */}
        <div className="col-span-1 flex flex-col space-y-5">
           <h4 className="font-display font-bold uppercase tracking-widest text-zinc-300 text-sm">
             Resources
           </h4>
           <nav className="flex flex-col space-y-3">
             <Link href="/#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">How it Works</Link>
             <Link href="/about" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">About Us</Link>
             <Link href="/contact" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Contact</Link>
             <Link href="/sitemap" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Sitemap</Link>
             <Link href="/legal/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Privacy Policy</Link>
           </nav>
        </div>

        {/* Col 4: Newsletter */}
        <div className="col-span-1 flex flex-col space-y-5">
           <h4 className="font-display font-bold uppercase tracking-widest text-zinc-300 text-sm">
             Snow Alerts
           </h4>
           <p className="text-xs text-zinc-500 font-medium">Get notified when a snow storm is approaching your area.</p>
           <form onSubmit={handleSubscribe} className="relative flex items-center">
             <div className="absolute left-3 text-zinc-500">
               <Search className="h-4 w-4" />
             </div>
             <input 
               type="email" 
               placeholder="Enter your email"
               required
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
             />
             <button 
               type="submit" 
               className="absolute right-2 p-1 text-zinc-400 hover:text-blue-400 transition-colors disabled:opacity-50"
               disabled={subscribed}
             >
               {subscribed ? <span className="text-xs text-green-400 font-bold">✓</span> : <Clock className="h-4 w-4" />}
             </button>
           </form>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} SnowSense™. All rights reserved.
            </p>
            <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-medium">
              Powered by Advanced Meteorology
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-x-8 text-xs text-zinc-500">
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
