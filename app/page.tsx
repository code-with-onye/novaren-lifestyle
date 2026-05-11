"use client";

import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/FadeIn';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <>
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-forest">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 w-full h-full overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/60 z-10" />
          <motion.div
             style={{ scale: useTransform(scrollY, [0, 800], [1.05, 1.15]) }}
             className="w-full h-full"
          >
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
              poster="https://res.cloudinary.com/dz7c3ar3k/video/upload/so_0/Say_hello_to_our_brand_new_3-bedroom_luxury_apartment_now_with_your_own_private_cinema_in_Wuye_A_exi2rw.jpg"
            >
              <source src="https://res.cloudinary.com/dz7c3ar3k/video/upload/Say_hello_to_our_brand_new_3-bedroom_luxury_apartment_now_with_your_own_private_cinema_in_Wuye_A_exi2rw.mp4" type="video/mp4" />
              <source src="https://res.cloudinary.com/dz7c3ar3k/video/upload/Say_hello_to_our_brand_new_3-bedroom_luxury_apartment_now_with_your_own_private_cinema_in_Wuye_A_exi2rw.webm" type="video/webm" />
            </video>
          </motion.div>
        </motion.div>

        <div className="relative z-20 text-center px-4 w-full max-w-5xl mx-auto flex flex-col items-center">
          <motion.p 
            initial={{ opacity: 0, letterSpacing: '0em' }}
            animate={{ opacity: 1, letterSpacing: '0.2em' }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="text-gold/90 uppercase text-sm md:text-md tracking-[0.2em] mb-6 font-semibold"
          >
            Premium Lifestyle Concierge
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="text-sand font-serif text-5xl md:text-7xl lg:text-8xl xl:text-[9rem] leading-[0.9] text-balance"
          >
            Find What <br/> <em className="italic font-light">Moves You</em>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-sand"
          >
            <ChevronDown className="animate-bounce w-8 h-8 opacity-70" />
          </motion.div>
        </div>
      </section>

      {/* Intro Statement */}
      <section className="py-32 md:py-48 px-6 bg-sand text-forest">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-gold uppercase tracking-widest text-sm mb-6 font-semibold">The Novaren Standard</p>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif leading-tight mb-8">
              The Gateway to <em className="italic text-forest-light">Luxury in Abuja.</em>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-forest/80 max-w-2xl mx-auto font-light leading-relaxed">
              Novaren Lifestyle was born from a simple observation: Abuja is a city of hidden gems, but accessing them requires more than just a map—it requires a relationship. For the global Nigerian and the international traveler, we are the trusted partner that ensures your time in the capital is seamless, secure, and sophisticated.
            </p>
          </FadeIn>
        </div>
      </section>
      
      {/* Visual Service Pillars */}
      <section className="py-32 bg-forest relative overflow-hidden text-sand">
         <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full flex flex-col items-center">
            <FadeIn>
               <h2 className="text-4xl md:text-6xl font-serif mb-20 text-center">Our Core <em className="italic text-sand/80">Expertise</em></h2>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-12 w-full">
               {[
                 {
                   name: "Novaren Stays",
                   subtitle: "Private Residences",
                   desc: "Your private sanctuary in the heart of the capital. High-end hotel service meets the discreet privacy of a home.",
                   image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"
                 },
                 {
                   name: "Novaren Wheels",
                   subtitle: "Prestige Rentals",
                   desc: "Mobility defined by status. A premiere fleet of luxury SUVs and executive sedans designed for the Abuja terrain.",
                   image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80"
                 },
                 {
                   name: "Novaren Access",
                   subtitle: "VIP Concierge",
                   desc: "The city is yours. We just have the keys. From VIP table reservations to private club entry and airport fast-tracking.",
                   image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80"
                 },
                 {
                   name: "Corporate Solutions",
                   subtitle: "B2B & Logistics",
                   desc: "Executive efficiency. The strategic logistics partner for embassies, multinational firms, and high-growth startups.",
                   image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
                 }
               ].map((service, idx) => (
                  <FadeIn key={idx} delay={idx * 0.2}>
                     <div className="group relative h-[400px] md:h-[500px] w-full overflow-hidden text-sand flex flex-col justify-end p-8 border border-sand/10 hover:border-gold/50 transition-colors">
                        <img src={service.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-60 mix-blend-overlay" alt={service.name} />
                        <div className="absolute inset-0 bg-linear-to-t from-forest via-forest/80 to-transparent"></div>
                        <div className="relative z-10">
                           <div className="text-gold uppercase tracking-widest text-xs font-semibold mb-2">{service.subtitle}</div>
                           <h3 className="text-3xl md:text-4xl font-serif mb-4">{service.name}</h3>
                           <p className="text-sand/80 font-light leading-relaxed max-w-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">{service.desc}</p>
                        </div>
                     </div>
                  </FadeIn>
               ))}
            </div>

            <FadeIn>
               <div className="mt-20 text-center">
                  <Link href="/services" className="inline-block border-b border-gold text-gold uppercase tracking-widest text-sm pb-1 hover:text-sand hover:border-sand transition-colors">
                     View All Services
                  </Link>
               </div>
            </FadeIn>
         </div>
      </section>
    </>
  );
}
