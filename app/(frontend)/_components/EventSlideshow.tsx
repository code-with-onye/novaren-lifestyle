"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";

export type EventSlide = { id: string; title: string; venue: string; imageUrl: string };

/** How long each event shows before sliding to the next. */
const SLIDE_MS = 5000;

// People who prefer reduced motion get no autoplay (they can still use the dots).
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

/**
 * Auto-advancing showcase of upcoming event images. Always slides forward (the
 * next image enters from the right), pauses on hover or when off-screen, and
 * stays in sync with the event list: the showing event's row is highlighted,
 * and hovering or tapping a row brings up its image.
 *
 * Timing is driven by the CSS progress bar on the active dot: when it finishes,
 * we advance. Pausing freezes the bar, so resuming continues where it left off.
 */
export default function EventSlideshow({ slides }: { slides: EventSlide[] }) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const autoplay = !useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const rootRef = useRef<HTMLDivElement>(null);
  const count = slides.length;

  const go = (next: number) => {
    setIndex((current) => {
      if (next === current) return current;
      setPrev(current);
      return next;
    });
  };

  // Pause while scrolled out of view (and so the first slide is fresh when it appears).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Highlight the showing event's row in the list beside the image.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-event-id]").forEach((row) => {
      row.classList.toggle("is-showing", count > 1 && row.dataset.eventId === slides[index]?.id);
    });
  }, [index, slides, count]);

  // Hovering, focusing or tapping a row shows that event's image.
  useEffect(() => {
    if (count < 2) return;
    const cleanups: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>("[data-event-id]").forEach((row) => {
      const i = slides.findIndex((s) => s.id === row.dataset.eventId);
      if (i < 0) return;
      const show = () => go(i);
      row.addEventListener("mouseenter", show);
      row.addEventListener("focusin", show);
      row.addEventListener("click", show);
      cleanups.push(() => {
        row.removeEventListener("mouseenter", show);
        row.removeEventListener("focusin", show);
        row.removeEventListener("click", show);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, [slides, count]);

  const paused = hovered || offscreen;

  return (
    <div
      ref={rootRef}
      className="event-photo slideshow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-roledescription="carousel"
      aria-label="Upcoming events"
    >
      {slides.map((s, i) => {
        const state = i === index ? "is-active" : i === prev ? "is-prev" : "";
        return (
          <div
            key={s.id}
            className={`slide ${state}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${s.title}`}
            aria-hidden={i !== index}
          >
            <Image
              src={s.imageUrl}
              alt={s.title}
              fill
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              sizes="(max-width: 700px) 100vw, 52vw"
            />
            <div className="image-note">
              <strong>{s.title}</strong>
              {s.venue}
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <div className="slide-dots">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={i === index ? "is-active" : undefined}
              aria-label={`Show ${s.title}`}
              aria-current={i === index}
              onClick={() => go(i)}
            >
              {i === index && autoplay && (
                <span
                  key={index}
                  className="slide-progress"
                  style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                  onAnimationEnd={() => go((index + 1) % count)}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
