"use client";

import { useState } from 'react';
import { FadeIn } from '@/components/FadeIn';

export default function Inquire() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    inquiryType: 'curated-stay',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          inquiryType: 'curated-stay',
          message: '',
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-8 bg-sand-dark p-8 md:p-12 rounded-sm border border-forest/10">
            {status === 'success' && (
              <div className="p-4 bg-forest/10 text-forest text-center font-medium rounded-sm">
                Thank you. Your inquiry has been received. Our team will be in touch shortly.
              </div>
            )}
            
            {status === 'error' && (
              <div className="p-4 bg-red-900/10 text-red-800 text-center font-medium rounded-sm">
                Something went wrong. Please try again later.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">First Name</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light" />
              </div>
              <div className="space-y-4">
                <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">Last Name</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light" />
            </div>

            <div className="space-y-4">
              <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">Inquiry Type</label>
              <select required name="inquiryType" value={formData.inquiryType} onChange={handleChange} className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light appearance-none rounded-none">
                <option value="curated-stay">Curated Stay (Shortlet)</option>
                <option value="prestige-mobility">Prestige Mobility (Car Rental)</option>
                <option value="the-abuja-access">The Abuja Access (Concierge)</option>
                <option value="brand-partnership">Brand Partnership</option>
                <option value="general-inquiry">General Inquiry</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-sm uppercase tracking-widest text-forest/70 font-medium">Message</label>
              <textarea required name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full bg-transparent border-b border-forest/20 py-2 focus:outline-none focus:border-forest transition-colors font-light resize-none"></textarea>
            </div>

            <button disabled={status === 'loading'} type="submit" className="w-full bg-forest text-sand uppercase tracking-widest text-sm py-5 hover:bg-forest-light transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {status === 'loading' ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
