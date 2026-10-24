"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Photo = { url: string; alt: string };

/**
 * The listing's photo grid plus a full-screen viewer. Any photo (or "View all")
 * opens the viewer, which shows whole, uncropped photos with arrows, keyboard
 * and swipe navigation, and a thumbnail strip.
 */
export default function StayGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  const [cover, ...rest] = photos;
  const thumbs = rest.slice(0, 4);
  const count = photos.length;

  // Remember which tile opened the viewer, so focus can return to it (Safari doesn't focus clicked buttons).
  const show = (i: number, trigger: HTMLElement) => {
    returnFocus.current = trigger;
    setIndex(i);
  };
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((by: number) => setIndex((i) => (i === null ? i : (i + by + count) % count)), [count]);

  useEffect(() => {
    if (!open) return;
    const returnTo = returnFocus.current;
    document.body.classList.add("nv-locked");
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("nv-locked");
      window.removeEventListener("keydown", onKey);
      returnTo?.focus({ preventScroll: true });
    };
  }, [open, close, step]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (index === null) return;
    stripRef.current
      ?.querySelector<HTMLElement>(`[data-i="${index}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  if (!cover) return null;

  return (
    <>
      <section className="stay-gallery container" data-count={thumbs.length}>
        <button type="button" className="stay-gallery-main" onClick={(e) => show(0, e.currentTarget)} aria-label={`View photo 1 of ${count}`}>
          <Image src={cover.url} alt={cover.alt} fill priority sizes="(max-width: 700px) 100vw, 60vw" />
        </button>
        {thumbs.map((p, i) => (
          <button
            key={p.url + i}
            type="button"
            className="stay-gallery-thumb"
            onClick={(e) => show(i + 1, e.currentTarget)}
            aria-label={`View photo ${i + 2} of ${count}`}
          >
            <Image src={p.url} alt={p.alt} fill sizes="(max-width: 700px) 50vw, 20vw" />
          </button>
        ))}
        {count > 1 && (
          <button type="button" className="gallery-all" onClick={(e) => show(0, e.currentTarget)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="3.5" y="3.5" width="7" height="7" />
              <rect x="13.5" y="3.5" width="7" height="7" />
              <rect x="3.5" y="13.5" width="7" height="7" />
              <rect x="13.5" y="13.5" width="7" height="7" />
            </svg>
            View all {count} photos
          </button>
        )}
      </section>

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
          <div className="lightbox-top">
            <span className="lightbox-count" aria-live="polite">
              {index + 1} / {count}
            </span>
            <button ref={closeRef} type="button" className="lightbox-close" onClick={close} aria-label="Close photos">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
              <span>Close</span>
            </button>
          </div>

          <div
            className="lightbox-stage"
            onClick={(e) => e.target === e.currentTarget && close()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="lightbox-frame" key={index}>
              <Image src={photos[index].url} alt={photos[index].alt} fill sizes="100vw" priority />
            </div>
            {count > 1 && (
              <>
                <button type="button" className="lightbox-nav prev" onClick={() => step(-1)} aria-label="Previous photo">
                  ‹
                </button>
                <button type="button" className="lightbox-nav next" onClick={() => step(1)} aria-label="Next photo">
                  ›
                </button>
              </>
            )}
          </div>

          {count > 1 && (
            <div className="lightbox-strip" ref={stripRef}>
              {photos.map((p, i) => (
                <button
                  key={p.url + i}
                  type="button"
                  data-i={i}
                  className={i === index ? "is-active" : undefined}
                  aria-label={`Photo ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                >
                  <Image src={p.url} alt="" fill sizes="96px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
