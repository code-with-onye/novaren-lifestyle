"use client";

import { useEffect, useRef, useState } from "react";
import { formatNaira } from "@/lib/dates";

type Props = {
  nightlyRate: number;
  minNights: number;
  children: React.ReactNode;
};

/**
 * Holds the booking card. On desktop it's a sticky sidebar; on phones and
 * tablets (CSS, ≤1000px) it becomes a bottom sheet opened from a floating bar,
 * so guests can pick dates without scrolling past the listing details.
 * The same card instance is used either way, so selections survive closing.
 */
export default function BookingPanel({ nightlyRate, minNights, children }: Props) {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    document.body.classList.add("nv-locked");
    sheetRef.current?.querySelector<HTMLElement>(".sheet-close")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Rotating to a wide screen turns the sheet back into the sidebar.
    const onResize = () => window.innerWidth > 1000 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.classList.remove("nv-locked");
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <aside ref={sheetRef} className={`stay-book${open ? " is-open" : ""}`} id="book" aria-label="Book this apartment">
        <div className="sheet-head">
          <span>Choose your dates</span>
          <button type="button" className="sheet-close" onClick={() => setOpen(false)} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </aside>

      <div className={`sheet-backdrop${open ? " is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="book-bar">
        <div className="book-bar-price">
          <strong>{formatNaira(nightlyRate)}</strong> / night
          {minNights > 1 && <span>Min. {minNights} nights</span>}
        </div>
        <button
          ref={triggerRef}
          type="button"
          className="btn book-bar-btn"
          aria-expanded={open}
          aria-controls="book"
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15.5" rx="1" />
            <path d="M3.5 9.5h17M8 3v4M16 3v4" />
          </svg>
          Choose dates
        </button>
      </div>
    </>
  );
}
