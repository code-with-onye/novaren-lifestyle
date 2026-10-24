import Link from "next/link";
import Image from "next/image";
import { InstagramIcon, MailIcon, PhoneIcon, WhatsAppIcon } from "./icons";
import { CONTACT, EMAIL, SOCIAL } from "./site";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="eyebrow">Prefer to talk?</div>
            <h3>We&apos;re a message away.</h3>
          </div>
          <div className="footer-quick">
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> WhatsApp
            </a>
            <a href={`tel:${CONTACT.phone}`}>
              <PhoneIcon /> Call
            </a>
            <a href={`mailto:${EMAIL}`}>
              <MailIcon /> Email
            </a>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" href="/" aria-label="Novaren Lifestyle home">
              <Image
                src="/logo-dark.png"
                alt="Novaren Lifestyle"
                width={245}
                height={221}
                className="footer-logo"
              />
            </Link>
            <p>Thoughtful stays, movement and experiences, arranged around you.</p>
            <div className="socials">
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Novaren on Instagram">
                <InstagramIcon />
              </a>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Novaren on WhatsApp">
                <WhatsAppIcon />
              </a>
              <a href={`mailto:${EMAIL}`} aria-label="Email Novaren">
                <MailIcon />
              </a>
            </div>
          </div>

          <div>
            <h4>Explore</h4>
            <div className="footer-links">
              <Link href="/stays">Stays</Link>
              <Link href="/#packages">Stay packages</Link>
              <Link href="/#wheels">Fleets</Link>
              <Link href="/#events">Events</Link>
              <Link href="/journal">Editorial</Link>
              <Link href="/about">About us</Link>
            </div>
          </div>

          <div>
            <h4>Personal assistance</h4>
            <div className="footer-links">
              <Link href="/#concierge">Request a concierge</Link>
              <Link href="/#concierge">Fast-tracking enquiry</Link>
              <Link href="/#concierge">Partner with us</Link>
              <Link href="/#faq">FAQs</Link>
            </div>
          </div>

          <div>
            <h4>Get in touch</h4>
            <dl className="footer-contact" style={{ margin: 0 }}>
              <dt>WhatsApp &amp; phone</dt>
              <dd>
                <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a>
              </dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </dd>
              <dt>Based in</dt>
              <dd>Abuja, Nigeria</dd>
            </dl>
          </div>
        </div>

        <div className="copyright">
          <span>© {new Date().getFullYear()} Novaren Lifestyle. All rights reserved.</span>
          <nav aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/journal">Editorial</Link>
            <a className="to-top" href="#home">
              Back to top ↑
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
