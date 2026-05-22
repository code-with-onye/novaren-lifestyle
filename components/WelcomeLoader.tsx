"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const TEXT = 'NOVAREN LIFESTYLE';

const T = {
  strokeDuration: 2.2,
  fillStart: 1.85,
  fillDuration: 0.85,
  strokeFadeStart: 2.45,
  strokeFadeDuration: 0.6,
  typeStart: 3.0,
  typePerChar: 0.085,
  hold: 1.0,
  exit: 0.9,
};
const TOTAL_MS = (T.typeStart + TEXT.length * T.typePerChar + T.hold) * 1000;

export default function WelcomeLoader() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typed, setTyped] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Decide on the client (avoids SSR/hydration flash on repeat visits in same session).
  useEffect(() => {
    setMounted(true);

    setIsLoading(true);

    for (let i = 1; i <= TEXT.length; i++) {
      timersRef.current.push(
        setTimeout(
          () => setTyped(i),
          (T.typeStart + i * T.typePerChar) * 1000,
        ),
      );
    }

    timersRef.current.push(
      setTimeout(() => {
        setIsLoading(false);
      }, TOTAL_MS),
    );

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isLoading]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          aria-hidden="true"
          role="presentation"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -24,
            transition: { duration: T.exit, ease: [0.65, 0, 0.35, 1] },
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest text-sand overflow-hidden"
        >
          {/* Ambient gold glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 45% at 50% 48%, rgba(179,134,70,0.22), transparent 70%)',
            }}
          />

          {/* Soft vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 55%, rgba(11,28,18,0.55) 100%)',
            }}
          />

          <div className="relative flex flex-col items-center px-6 mt-8">
            {/* SVG Monogram Tracing */}
            <svg viewBox="0 0 170 100" className="w-[180px] md:w-[240px] h-auto overflow-visible mb-0">
              {[
                // Left Stem & Serif (Sand)
                { d: "M 45 20 L 65 20 L 65 90 L 50 90 Q 40 90 30 95 L 30 90 Q 45 90 45 75 Z", color: "var(--color-sand)" },
                // Diagonal (Sand)
                { d: "M 65 20 L 80 20 L 105 90 L 90 90 Z", color: "var(--color-sand)" },
                // Right Stem (Sand)
                { d: "M 100 20 L 105 20 L 105 90 L 100 90 Z", color: "var(--color-sand)" },
                // Right Top Serif (Sand)
                { d: "M 80 20 Q 95 20 100 35 L 100 20 Z", color: "var(--color-sand)" },
                // L Gold Swoosh (Gold)
                { d: "M 105 90 L 135 90 L 135 60 Q 135 90 105 90 Z", color: "var(--color-gold)" }
              ].map((path, index) => (
                <motion.path
                  key={index}
                  d={path.d}
                  fill={path.color}
                  stroke={path.color}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={{ 
                    strokeDasharray: 300, 
                    strokeDashoffset: 300,
                    fillOpacity: 0,
                    strokeOpacity: 1
                  }}
                  animate={{ 
                    strokeDashoffset: 0, 
                    fillOpacity: 1,
                    strokeOpacity: 0 
                  }}
                  transition={{ 
                    strokeDashoffset: { duration: T.strokeDuration, ease: "easeInOut" },
                    fillOpacity: { duration: T.fillDuration, delay: T.fillStart, ease: "easeIn" },
                    strokeOpacity: { duration: T.strokeFadeDuration, delay: T.strokeFadeStart, ease: "easeOut" }
                  }}
                />
              ))}
            </svg>

            {/* NOVAREN LIFESTYLE — typed character-by-character with blinking caret */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: T.typeStart - 0.3 }}
              className="mt-0 h-6 md:h-7 flex items-center"
            >
              <span
                className="font-sans uppercase text-gold text-xs md:text-sm font-semibold tabular-nums"
                style={{
                  letterSpacing: '0.45em',
                  paddingLeft: '0.45em', // compensate trailing tracking to re-center
                }}
              >
                {TEXT.slice(0, typed)}
                <motion.span
                  aria-hidden
                  className="inline-block w-px h-[1.1em] bg-gold align-middle"
                  style={{ marginLeft: '4px' }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
