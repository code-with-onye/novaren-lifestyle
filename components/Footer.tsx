"use client";

import { ArrowRight, Mail } from 'lucide-react';
import { FadeIn } from './FadeIn';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-forest text-sand pt-32 pb-12 snap-start">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <FadeIn>
          <h2 className="text-5xl md:text-8xl font-serif mb-8 text-balance">
             <em className="italic text-sand/80">Ready to experience Abuja?</em>
          </h2>
          <p className="text-lg md:text-xl font-light text-sand/60 mb-12 max-w-2xl mx-auto">
            Connect with us today and let us handle the logistics so you can focus on the moment.
          </p>
          <Link href="/inquire" className="flex items-center justify-between w-full max-w-md mx-auto group border border-sand/30 rounded-full px-8 py-5 hover:bg-sand hover:text-forest transition-all overflow-hidden relative cursor-pointer block">
            <span className="uppercase tracking-widest text-sm relative z-10">Request Access</span>
            <ArrowRight className="group-hover:translate-x-2 transition-transform relative z-10 block" />
          </Link>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-32 pt-12 border-t border-sand/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <img 
            src="/logo-dark.png" 
            alt="Novaren Lifestyle" 
            className="h-12 w-auto object-contain" 
          />
        </Link>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-6 text-sm text-sand/60 uppercase tracking-widest items-center">
          <span className="hover:text-gold transition-colors">Abuja, Nigeria</span>
          <a href="mailto:novarenlifestyle@yahoo.com" className="hover:text-gold transition-colors">novarenlifestyle@yahoo.com</a>
          <a href="https://wa.me/2348036768678" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">+234 803 676 8678</a>
        </div>

        <div className="flex space-x-4">
          <a href="https://instagram.com/novarenlifestyle" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-sand/20 flex flex-col items-center justify-center hover:bg-sand hover:text-forest transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <a href="mailto:novarenlifestyle@yahoo.com" className="w-10 h-10 rounded-full border border-sand/20 flex flex-col items-center justify-center hover:bg-sand hover:text-forest transition-all">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
