"use client";

import { FadeIn } from '@/components/FadeIn';

export default function Inquire() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-sand text-forest flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full px-6 md:px-12">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-serif mb-6 text-forest">Request <br/><em className="italic text-forest">Access</em></h1>
            <p className="text-forest/70 font-light text-xl">Begin your journey to seamless living. Submit your inquiry to connect with our concierge team.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <form className="space-y-8 bg-sand-dark p-8 md:p-12 rounded-sm border border-forest/10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">First Name</label>
                <input type="text" className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light" />
              </div>
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">Last Name</label>
                <input type="text" className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">Email Address</label>
              <input type="email" className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light" />
            </div>

            <div className="space-y-4">
              <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">Inquiry Type</label>
              <select className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light appearance-none rounded-none">
                <option>Curated Stay (Shortlet)</option>
                <option>Prestige Mobility (Car Rental)</option>
                <option>The Abuja Access (Concierge)</option>
                <option>Brand Partnership</option>
                <option>General Inquiry</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">Message</label>
              <textarea rows={4} className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light resize-none"></textarea>
            </div>

            <button type="button" className="w-full bg-forest text-sand uppercase tracking-widest text-sm py-5 hover:bg-forest-light transition-colors font-medium">
              Submit Inquiry
            </button>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
