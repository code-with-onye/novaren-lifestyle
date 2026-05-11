"use client";

import { FadeIn } from '@/components/FadeIn';

export default function Approach() {
  return (
    <div className="pt-32 min-h-screen bg-forest text-sand">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <section className="py-24 border-b border-sand/10">
          <FadeIn>
            <p className="text-gold uppercase tracking-widest text-sm mb-6 font-semibold">The Novaren Standard</p>
            <h1 className="text-5xl md:text-8xl font-serif mb-8 leading-tight">
              Support Beyond <br/> <em className="italic text-sand/80">Access.</em>
            </h1>
            <p className="text-xl font-light text-sand/70 max-w-2xl">
              Behind every seamless client experience is a meticulously structured operation. This is how Novaren guarantees prestige, reliability, and absolute discretion.
            </p>
          </FadeIn>
        </section>

        <section className="py-32">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-24">
            {[
              {
                title: "Vendor & Supplier Vetting",
                desc: "We relentlessly source and manage exclusive relationships with premier apartment owners, luxury fleet operators, and elite venue managers. Rigorous vetting ensures that our standards of quality, reliability, and absolute discretion are never compromised."
              },
              {
                title: "The Experience-First Doctrine",
                desc: "Our recommendations are never reliant on guesswork. The Novaren team personally dines at, stays in, and evaluates every property and establishment before presenting it to our clients. Firsthand knowledge is our ultimate differentiator."
              },
              {
                title: "Intentional Network Building",
                desc: "We engage directly with the pulse of the city. By strategically representing Novaren at premier events and within elite professional circles, we curate a powerful network that translates into unrivaled access and bespoke opportunities for our clients."
              }
            ].map((step, idx) => (
              <FadeIn key={idx} delay={idx * 0.2}>
                <div className="mb-8 overflow-hidden rounded-sm h-48 md:h-64">
                   <img 
                      src={`https://images.unsplash.com/photo-${idx === 0 ? '1600607688969-a5bfcd6e4ebd' : idx === 1 ? '1414235077428-971ef9f2e7f8' : '1505362958293-f11186e8a002'}?auto=format&fit=crop&q=80`} 
                      className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                      alt={step.title}
                   />
                </div>
                <div className="flex items-start gap-6">
                   <div className="text-gold font-serif text-2xl">0{idx + 1}</div>
                   <div>
                      <h3 className="text-2xl font-serif mb-4 text-sand">{step.title}</h3>
                      <p className="text-sand/70 font-light leading-relaxed">{step.desc}</p>
                   </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
        
        <section className="py-24 border-t border-sand/10 text-center max-w-3xl mx-auto">
           <FadeIn>
              <h2 className="text-3xl font-serif mb-8 text-sand">We build long-term partnerships, not one-off transactions.</h2>
              <p className="text-sand/70 font-light text-lg">Our structure is built around delivering absolute perfection and reliability to our clients, ensuring their every lifestyle need is anticipated and flawlessly executed.</p>
           </FadeIn>
        </section>

      </div>
    </div>
  );
}
