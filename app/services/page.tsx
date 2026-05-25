"use client";

import { useEffect, useRef, useCallback } from 'react';
import { FadeIn } from '@/components/FadeIn';

function EmbedVideo({ src }: { src: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const autoplaySrc = src.includes('?')
    ? `${src}&autoplay=true&loop=true&muted=true&controls=false`
    : `${src}?autoplay=true&loop=true&muted=true&controls=false`;

  useEffect(() => {
    const container = containerRef.current;
    const iframe = iframeRef.current;
    if (!container || !iframe) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Set src to trigger autoplay when scrolled into view
          if (!iframe.src || iframe.src === 'about:blank') {
            iframe.src = autoplaySrc;
          }
        } else {
          // Clear src to stop playback when scrolled away
          iframe.src = 'about:blank';
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [autoplaySrc]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <iframe
        ref={iframeRef}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        className="border-0 pointer-events-none"
        style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: '100vw',
          height: '56.25vw', // 16:9 aspect ratio
          minHeight: '100vh',
          minWidth: '177.77vh', // 16:9 aspect ratio
        }}
      />
    </div>
  );
}

const SERVICES = [
  {
    title: "Novaren Stays",
    subtitle: "Your Private Sanctuary in the Heart of the Capital",
    description:
      "At Novaren, we believe luxury is found in the details. Our portfolio of short-term residences in Maitama, Wuse 2, and Asokoro offers the perfect blend of high-end hotel service and the discreet privacy of a home. Whether you are in town for a diplomatic mission or a weekend of leisure, our spaces are curated to reflect your standard of living.",
    features: [
      "24/7 Elite Security & Concierge",
      "High-Speed Fiber Internet & Workstations",
      "Discreet, Professional Housekeeping",
      "Prime Locations (Walking distance to Abuja’s top spots)",
    ],
    video:
      "https://player.cloudinary.com/embed/?cloud_name=dz7c3ar3k&public_id=7be14a67-eda8-481d-a6d3-f99dbc6a079a_mvtsq2",
    isEmbed: true,
  },
  {
    title: "Novaren Wheels",
    subtitle: "Mobility Defined by Status",
    description:
      "The way you move matters. Novaren Wheels provides a premiere fleet of luxury SUVs and executive sedans designed for the Abuja terrain. Choose our professional chauffeur service to navigate the city with ease, or take the wheel yourself with our self-drive luxury options.",
    features: [
      "The Executive Class: Sleek sedans for the business professional",
      "The Power Class: High-performance SUVs for presence and security",
      "The Convoy: Specialized logistics for high-profile delegations and events",
    ],
    video:
      "https://player.cloudinary.com/embed/?cloud_name=dz7c3ar3k&public_id=Arrive_in_style_every_time._Enjoy_the_best_of_London_with_our_top-tier_chauffeur_service._Get_i_yzs1ij",
    isEmbed: true,
  },
  {
    title: "Novaren Access",
    subtitle: "The City is Yours. We Just Have the Keys",
    description:
      "Don't just visit Abuja—belong to it. Novaren Access is our bespoke concierge service designed to remove the friction of the city. From last-minute VIP table reservations at the city’s most exclusive restaurants to private club entry and airport fast-tracking, we handle the logistics so you can focus on the moment.",
    features: [
      "Airport Meet-and-Greet & Fast-Track Immigration",
      "Priority Reservations at Member-Only Venues",
      "Private Chef & Wellness Sourcing",
      "Personalized City Itineraries",
    ],
    image:
      "https://res.cloudinary.com/dz7c3ar3k/image/upload/v1778516782/IMG_2869_vicmqv.jpg",
    isImage: true,
  },
  {
    title: "Corporate Solutions",
    subtitle: "Executive Efficiency. Institutional Reliability.",
    description:
      "Novaren Lifestyle serves as the strategic logistics partner for embassies, multinational firms, and high-growth startups. We provide a 'soft landing' for visiting executives, handling everything from secure document movement to full-scale guest management.",
    features: [
      "Logistics & Errands: Secure, professional movement of high-value assets and documents",
      "Expat Soft-Landing: Comprehensive support for international professionals relocating to Abuja",
      "Partner Retainers: Monthly subscription models for recurring corporate logistics",
    ],
    image:
      "https://res.cloudinary.com/dz7c3ar3k/image/upload/v1778516698/IMG_0696_zcf74c.jpg",
    isImage: true,
  },
  {
    title: "Novaren Moments",
    subtitle: "Event Curation and Recommendation",
    description:
      "We handle intimate small event experiences room decoration for honeymoons, birthdays, Valentine’s, Christmas setups, and special occasions. We also source the right vendors and planners to bring a client’s event vision to life from start to finish. Additionally we recommend existing events in Abuja that are worth our clients’ time and attendance.",
    features: [
      "Intimate small event experiences & room decoration",
      "Vendor & planner sourcing",
      "Abuja event recommendations"
    ],
    image: "/services/novaren_moments.png",
    isImage: true,
  },
  {
    title: "Brand Partnership Programme",
    subtitle: "Curated Lifestyle Partnerships",
    description:
      "We partner with premium restaurants, spas, hotels, and lifestyle brands in Abuja. They pay to be on our recommended list and we create experience content at their establishments giving our clients trusted recommendations and giving brands warm referrals from exactly the right audience.",
    features: [
      "Premium brand partnerships",
      "Experience content creation",
      "Trusted client recommendations"
    ],
    image: "/services/brand_partnerships.png",
    isImage: true,
  },
  {
    title: "Gifting & Procurement",
    subtitle: "Bespoke Luxury Sourcing",
    description:
      "We source and curate luxury gifts, flowers, hampers, souvenirs, and bespoke gift packages for any occasion. Whether it is a corporate gift order, a birthday surprise, or party shopping and sourcing, we handle the entire procurement process so our clients never have to step into a market or spend time searching. Every gift sourced through Novaren reflects the same standard of taste and care we bring to everything else.",
    features: [
      "Luxury gifts & bespoke packages",
      "Corporate & personal occasion sourcing",
      "End-to-end procurement process"
    ],
    image: "/services/gifting_procurement.png",
    isImage: true,
  },
  {
    title: "Curated Travel Experiences",
    subtitle: "Seamless Travel & Getaways",
    description:
      "Nigeria trips(for now), weekend getaways, and curated itineraries beyond Abuja. We plan, vet, and book the full experience so clients travel with zero stress and complete confidence.",
    features: [
      "Weekend getaways & Nigeria trips",
      "Curated itineraries",
      "End-to-end planning & booking"
    ],
    image: "/services/curated_travel.png",
    isImage: true,
  },
];

export default function Services() {
  useEffect(() => {
    document.documentElement.classList.add('snap-y', 'snap-mandatory');
    return () => document.documentElement.classList.remove('snap-y', 'snap-mandatory');
  }, []);

  return (
    <div className="w-full bg-forest text-sand">
      {/* Intro section, also snaps */}
      <section className="h-screen w-full snap-start relative flex flex-col justify-center px-6 md:px-12 bg-forest text-sand">
        <div className="max-w-7xl mx-auto w-full relative z-20">
          <FadeIn>
            <p className="text-gold uppercase tracking-widest text-sm mb-6 font-semibold">Services</p>
            <h1 className="text-5xl md:text-8xl font-serif mb-8 leading-tight">
              Our Core <br/> <em className="italic text-sand/80">Curations.</em>
            </h1>
            <p className="text-xl font-light text-sand/70 max-w-2xl">
              Scroll down to explore our exclusive service categories, each designed to deliver a seamless, high-quality experience for our clients.
            </p>
          </FadeIn>
        </div>
        
        {/* Subtle scroll indicator */}
        <FadeIn delay={0.5} className="absolute bottom-12 left-1/2 -translate-x-1/2">
           <div className="flex flex-col items-center opacity-70">
              <span className="text-xs uppercase tracking-widest text-gold mb-4">Scroll Down</span>
              <div className="w-px h-16 bg-sand/20 overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1/2 bg-gold animate-bounce" />
              </div>
           </div>
        </FadeIn>
      </section>

      {/* Primary Video Services */}
      {SERVICES.map((service, idx) => (
        <section key={idx} className="h-screen w-full snap-start relative flex items-center justify-start overflow-hidden bg-forest">
          <div className="absolute inset-0 z-0">
             {/* Cinematic Multi-layered Overlay */}
             <div className="absolute inset-0 z-10">
                <div className="absolute inset-0 bg-black/40" /> {/* Base Tint */}
                <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/40 to-transparent" /> {/* Left Shadow */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" /> {/* Bottom Shadow */}
             </div>
             {'isEmbed' in service && service.isEmbed ? (
               <EmbedVideo src={service.video || ''} />
             ) : 'isImage' in service && service.isImage ? (
               <img 
                 src={service.image} 
                 className="w-full h-full object-cover" 
                 alt={service.title} 
               />
             ) : (
               <video 
                 autoPlay 
                 loop 
                 muted 
                 playsInline 
                 className="w-full h-full object-cover"
               >
                  <source src={service.video} type="video/mp4" />
               </video>
             )}
          </div>
          
          <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 w-full">
            <FadeIn>
               <p className="font-serif text-5xl md:text-6xl text-gold/50 mb-4">0{idx + 1}</p>
               <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif">{service.title}</h2>
               <p className="tracking-widest uppercase text-xs md:text-sm text-gold/80 font-medium mt-4 mb-6">{service.subtitle}</p>
               <p className="text-lg md:text-xl font-light text-sand/90 leading-relaxed max-w-2xl mb-8">
                  {service.description}
               </p>
               
               <ul className="space-y-4">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-4 text-sand/80 max-w-xl">
                      <span className="text-gold mt-1.5 opacity-70 shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                      <span className="font-light leading-relaxed">{feature}</span>
                    </li>
                  ))}
               </ul>
            </FadeIn>
          </div>
        </section>
      ))}
    </div>
  );
}
