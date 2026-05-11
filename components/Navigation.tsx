"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const isLightBackground = pathname === '/about' || pathname === '/inquire';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-forest text-sand py-4 shadow-lg' : `bg-transparent py-6 ${isLightBackground ? 'text-forest' : 'text-sand'}`}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-widest uppercase relative z-50">
            Novaren
          </Link>
          
          <div className="hidden md:flex items-center space-x-12 tracking-widest text-xs uppercase font-medium">
            <Link href="/about" className="hover:text-gold transition-colors">Who We Are</Link>
            <Link href="/services" className="hover:text-gold transition-colors">Services</Link>
            <Link href="/approach" className="hover:text-gold transition-colors">How We Work</Link>
            <Link href="/inquire" className="border border-current px-6 py-2 rounded-full hover:bg-forest hover:text-sand transition-colors">Inquire</Link>
          </div>

          <button 
            className="md:hidden relative z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} className="text-sand" /> : <Menu size={28} className={!isScrolled && isLightBackground ? "text-forest" : "text-sand"} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <motion.div 
        initial={false}
        animate={{ opacity: isMobileMenuOpen ? 1 : 0, pointerEvents: isMobileMenuOpen ? 'auto' : 'none' }}
        className="fixed inset-0 bg-forest text-sand z-40 flex flex-col justify-center items-center space-y-8 text-2xl font-serif"
      >
        <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>Who We Are</Link>
        <Link href="/services" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
        <Link href="/approach" onClick={() => setIsMobileMenuOpen(false)}>How We Work</Link>
        <Link href="/inquire" onClick={() => setIsMobileMenuOpen(false)}>Inquire</Link>
      </motion.div>
    </>
  );
}
