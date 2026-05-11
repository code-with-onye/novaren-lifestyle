"use client";

import { FadeIn } from '@/components/FadeIn';

export default function About() {
  return (
    <div className="pt-32 pb-16 bg-sand min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Intro */}
        <section className="py-24 border-b border-forest/10">
          <FadeIn>
            <p className="text-gold uppercase tracking-widest text-sm mb-6 font-semibold">The Brand Story</p>
            <h1 className="text-5xl md:text-8xl font-serif text-forest mb-12 max-w-4xl leading-tight">
              The Novaren <br/> <em className="italic text-forest-light">Standard.</em>
            </h1>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-12">
            <FadeIn delay={0.2}>
              <p className="text-xl font-light text-forest/80 leading-relaxed">
                Novaren Lifestyle was born from a simple observation: Abuja is a city of hidden gems, but accessing them requires more than just a map—it requires a relationship. We are a premier lifestyle management company dedicated to bridging the gap between luxury and local insight.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="text-xl font-light text-forest/80 leading-relaxed">
                For the global Nigerian and the international traveler, we are the trusted partner that ensures your time in the capital is seamless, secure, and sophisticated.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Foundations */}
        <section className="py-32">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-serif text-forest mb-16">The Foundations</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-12">
             {[
               { title: "Experience-First Philosophy", desc: "We do not recommend what we haven't experienced. Every venue, stay, and event is personally vetted by the founding team to guarantee absolute quality." },
               { title: "Direct & Discreet Sourcing", desc: "We negotiate directly for the best rates and absolute privacy. Our network of premium properties and fleets ensures your stay remains exclusive and secure." },
               { title: "The Abuja Network", desc: "Beyond standard concierge services, we have deep roots in Abuja's elite circles, giving you access to genuine insider experiences and bespoke lifestyle management." }
             ].map((item, idx) => (
                <FadeIn key={idx} delay={idx * 0.2}>
                   <h3 className="text-2xl font-serif mb-4 text-forest">{item.title}</h3>
                   <div className="w-12 h-px bg-gold mb-4"></div>
                   <p className="text-forest/70 font-light leading-relaxed">{item.desc}</p>
                </FadeIn>
             ))}
          </div>
        </section>

        {/* The North Star (Vision) */}
        <section className="py-32 bg-forest text-sand mx--6 md:mx--12 px-6 md:px-12 rounded-t-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
            <div className="font-serif text-[20rem] leading-none">N</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
              <FadeIn>
                <h2 className="text-5xl md:text-7xl font-serif">Our North <br/><em className="italic text-gold/90">Star</em></h2>
              </FadeIn>
              <FadeIn>
                <p className="max-w-sm text-sand/70 font-light md:text-right text-lg">
                  A steady ascent to becoming the most trusted premium lifestyle concierge brand in Africa, beginning in the capital.
                </p>
              </FadeIn>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
               {[
                 { 
                   phase: "01",
                   title: "The Abuja Ecosystem", 
                   desc: "Direct, middleman-free relationships with premium apartment owners and luxury fleets. We control the quality and the standards." 
                 },
                 { 
                   phase: "02",
                   title: "The Novaren Pass", 
                   desc: "In development: An exclusive access tier granting VIP entry and priority reservations to Abuja's most sought-after establishments." 
                 },
                 { 
                   phase: "03",
                   title: "Pan-Nigeria", 
                   desc: "Curating bespoke travel experiences across Nigeria, expanding our rigorous vetting process to high-value destinations nationwide." 
                 },
                 { 
                   phase: "04",
                   title: "Global Footprint", 
                   desc: "Expanding across Africa and globally. Always upholding the same standard: we experience it firsthand before we recommend it to you." 
                 }
               ].map((item, idx) => (
                 <FadeIn key={idx} delay={idx * 0.2}>
                   <div className="group relative pt-8 border-t border-sand/20 hover:border-gold transition-colors duration-500 h-full">
                     <div className="text-xs uppercase tracking-widest text-gold/80 mb-6 font-medium">Phase {item.phase}</div>
                     <h3 className="text-2xl font-serif mb-4 group-hover:text-gold transition-colors">{item.title}</h3>
                     <p className="text-sand/70 font-light leading-relaxed group-hover:text-sand/90 transition-colors">
                       {item.desc}
                     </p>
                   </div>
                 </FadeIn>
               ))}
            </div>
            
            <FadeIn>
               <div className="mt-32 relative">
                  <div className="absolute left-1/2 -top-16 -translate-x-1/2 w-px h-16 bg-linear-to-b from-transparent to-gold/30"></div>
                  <div className="text-center relative z-10 p-12 lg:p-16 border border-sand/10 bg-sand/5 rounded-sm">
                    <p className="text-xl lg:text-3xl font-serif text-sand/90 max-w-4xl mx-auto leading-relaxed">
                        <span className="text-gold opacity-50 text-4xl mr-2">"</span>
                        Every decision we make, every booking, every conversation, every event we attend — moves us toward curating the ultimate luxury experience.
                        <span className="text-gold opacity-50 text-4xl ml-2">"</span>
                    </p>
                  </div>
               </div>
            </FadeIn>
          </div>
        </section>

      </div>
    </div>
  );
}
