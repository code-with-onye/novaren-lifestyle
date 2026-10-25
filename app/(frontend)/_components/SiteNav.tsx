"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CONTACT, EMAIL, NAV_LINKS, activePageLink } from "./site";

export default function SiteNav({ staysEnabled }: { staysEnabled: boolean }) {
  // While online booking is off, "Stays" points at the homepage rates instead.
  const links = NAV_LINKS.map((l) => (l.href === "/stays" && !staysEnabled ? { ...l, href: "/#pricing" } : l));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const pageLink = activePageLink(pathname);
  const active = pageLink ?? (isHome ? activeSection : null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Shrink + shadow once the page scrolls (rAF-throttled).
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the homepage, highlight the link for the section currently in view.
  useEffect(() => {
    if (!isHome) return;
    const sections = links.filter((l) => l.href.startsWith("/#"))
      .map((l) => document.getElementById(l.href.slice(2)))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(`/#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => {
      observer.disconnect();
      setActiveSection(null);
    };
  }, [isHome]); // eslint-disable-line react-hooks/exhaustive-deps -- links only change on redeploy

  // Lock scroll, close on Escape and move focus while the drawer is open.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("nv-locked");
    drawerRef.current?.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth > 1000 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.classList.remove("nv-locked");
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link className="brand" href="/" aria-label="Novaren Lifestyle home">
            <Image
              src="/logo-mark.png"
              alt=""
              width={203}
              height={164}
              priority
              className="brand-mark"
            />
            <span className="brand-name">
              NOVAREN<small>Lifestyle &amp; Concierge</small>
            </span>
          </Link>

          <nav className="navlinks" aria-label="Primary">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={active === l.href ? "active" : undefined}
                aria-current={active === l.href ? (l.href === pageLink ? "page" : "true") : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <Link className="btn nav-cta" href="/#concierge">
              Enquire <span className="arrow">↗</span>
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className={`menu-toggle${open ? " open" : ""}`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="nv-drawer"
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer-backdrop${open ? " open" : ""}`} onClick={close} aria-hidden="true" />
      <div
        id="nv-drawer"
        ref={drawerRef}
        className={`drawer${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        {/* The header's toggle sits under this panel, so the panel needs its own close button. */}
        <button type="button" className="drawer-close" onClick={close} aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <nav aria-label="Mobile">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={close}
              className={active === l.href ? "active" : undefined}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link className="btn" href="/#concierge" onClick={close}>
          Make an enquiry <span className="arrow">↗</span>
        </Link>
        <div className="drawer-contact">
          <h4>Get in touch</h4>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" data-umami-event="WhatsApp click" data-umami-event-location="menu">
            WhatsApp · {CONTACT.phoneDisplay}
          </a>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <span>Abuja, Nigeria</span>
        </div>
      </div>
    </>
  );
}
