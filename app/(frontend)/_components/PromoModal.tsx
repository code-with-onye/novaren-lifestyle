"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ENQUIRE_EVENT, PROMO_OPEN_EVENT, type EnquireDetail } from "./site";
import { track } from "@/lib/analytics";

// Hosted on the site's Cloudinary account (video asset novaren/promo/goodnight-abuja).
// Cloudinary picks the best codec/quality per browser; 540px wide covers the
// player at 2x on desktop and full-bleed on phones.
const CLOUDINARY_VIDEO = "https://res.cloudinary.com/dmyvptbzw/video/upload";
const VIDEO_SRC = `${CLOUDINARY_VIDEO}/q_auto,vc_auto,w_540/novaren/promo/goodnight-abuja.mp4`;
const POSTER_SRC = `${CLOUDINARY_VIDEO}/so_2,q_auto,f_auto,w_540/novaren/promo/goodnight-abuja.jpg`;

const STORAGE_KEY = "nv-promo-dismissed-at";
const AUTO_OPEN_DELAY_MS = 7000;
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export type PromoPackage = {
  id: string;
  title: string;
  priceLabel: string;
  featuredLabel: string | null;
};

/** Opens the promo from anywhere on the page, even if it was dismissed earlier. */
export function PromoTrigger({ className = "promo-trigger" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(PROMO_OPEN_EVENT))}
    >
      <span className="promo-trigger-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>
      Watch: Abuja after dark
    </button>
  );
}

export default function PromoModal({ packages }: { packages: PromoPackage[] }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback((source: "automatic" | "watch button") => {
    track("Promo opened", { source });
    returnFocus.current = document.activeElement as HTMLElement | null;
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setMuted(true);
    setOpen(true);
    // Two frames so the closed styles paint before transitioning in.
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const hide = useCallback((restoreFocus = true) => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Storage can be unavailable (private mode); the promo just shows again next visit.
    }
    window.setTimeout(() => {
      setOpen(false);
      setPlaying(false);
      if (restoreFocus) returnFocus.current?.focus?.();
    }, 320);
  }, []);

  // Auto-open once, unless dismissed recently or the visitor is busy.
  useEffect(() => {
    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
      // Ignore; treat as never dismissed.
    }
    if (Date.now() - dismissedAt < SNOOZE_MS) return;
    // Arriving on a specific section (e.g. /#concierge) signals intent; don't interrupt.
    if (window.location.hash) return;

    const timer = window.setTimeout(() => {
      const active = document.activeElement;
      const typing = active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
      const menuOpen = document.body.classList.contains("nv-locked");
      if (!typing && !menuOpen) show("automatic");
    }, AUTO_OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [show]);

  // Manual open via <PromoTrigger />.
  useEffect(() => {
    const onOpen = () => show("watch button");
    window.addEventListener(PROMO_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(PROMO_OPEN_EVENT, onOpen);
  }, [show]);

  // While open: lock page scroll, move focus in, close on Escape, keep Tab inside.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("nv-locked");
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hide();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("nv-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, hide]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    // React only applies `muted` on mount, so drive the element directly.
    video.muted = !video.muted;
    setMuted(video.muted);
    if (video.paused) void video.play();
  };

  const play = () => void videoRef.current?.play();

  const enquire = (item: string) => {
    hide(false);
    window.dispatchEvent(
      new CustomEvent<EnquireDetail>(ENQUIRE_EVENT, { detail: { item, type: "Stay package" } }),
    );
    document.getElementById("concierge")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!open) return null;

  return (
    <div className={`promo${visible ? " is-visible" : ""}`}>
      <div className="promo-backdrop" onClick={() => hide()} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="promo-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        aria-describedby="promo-desc"
      >
        <button ref={closeRef} type="button" className="promo-close" onClick={() => hide()} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="promo-media">
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            autoPlay={!reduceMotion}
            muted
            loop
            playsInline
            preload="auto"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label="Abuja at night, filmed from above"
          />
          {!playing && reduceMotion && (
            <button type="button" className="promo-play" onClick={play} aria-label="Play video">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="promo-sound"
            onClick={toggleSound}
            aria-pressed={!muted}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none" />
              {muted ? (
                <path d="M16 9.5l5 5M21 9.5l-5 5" />
              ) : (
                <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />
              )}
            </svg>
            {muted ? "Sound off" : "Sound on"}
          </button>
        </div>

        <div className="promo-body">
          <div className="eyebrow">Novaren stay packages</div>
          <h2 id="promo-title">
            Abuja after dark, <em>arranged for you.</em>
          </h2>
          <p id="promo-desc">
            A place to stay, a car on call and one point of contact for everything in between.
            Choose a package and we&apos;ll take care of the details.
          </p>

          <ul className="promo-packages">
            {packages.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={p.featuredLabel ? "is-featured" : undefined}
                  onClick={() => enquire(p.title)}
                >
                  <span className="promo-pkg-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="promo-pkg-name">
                    {p.title}
                    {p.featuredLabel && <small>{p.featuredLabel}</small>}
                  </span>
                  <span className="promo-pkg-price">
                    {p.priceLabel === "Price on request" ? "On request" : p.priceLabel}
                  </span>
                  <span className="promo-pkg-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="promo-actions">
            <button type="button" className="btn" onClick={() => enquire("A stay package")}>
              Plan my stay <span className="arrow">↗</span>
            </button>
            <Link className="btn ghost" href="/#packages" onClick={() => hide(false)}>
              See what&apos;s included
            </Link>
          </div>
          <p className="promo-fine">Inclusions and rates are confirmed with your quotation.</p>
        </div>
      </div>
    </div>
  );
}
