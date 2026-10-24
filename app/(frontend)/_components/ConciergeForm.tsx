"use client";

import { useEffect, useRef, useState } from "react";
import { ENQUIRE_EVENT, REQUEST_TYPES, type EnquireDetail, type RequestType } from "./site";
import { track } from "@/lib/analytics";

type Status = "idle" | "loading" | "success" | "error";

const initial = {
  name: "",
  email: "",
  whatsapp: "",
  type: "General concierge request" as RequestType,
  when: "",
  details: "",
};

export default function ConciergeForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");
  const nameRef = useRef<HTMLInputElement>(null);

  // Prefill from "Enquire" buttons elsewhere on the page.
  useEffect(() => {
    const onEnquire = (e: Event) => {
      const { item, type } = (e as CustomEvent<EnquireDetail>).detail;
      setForm((f) => ({ ...f, type, details: `I would like to enquire about: ${item}` }));
      setStatus("idle");
      nameRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener(ENQUIRE_EVENT, onEnquire);
    return () => window.removeEventListener(ENQUIRE_EVENT, onEnquire);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const [firstName, ...rest] = form.name.trim().split(/\s+/);
    const inquiryType =
      REQUEST_TYPES.find((t) => t.label === form.type)?.value ?? "general-inquiry";
    const meta = [
      `Request type: ${form.type}`,
      form.when && `When: ${form.when}`,
      form.whatsapp && `WhatsApp: ${form.whatsapp}`,
      "Source: /lifestyle concierge form",
    ].filter(Boolean);
    const message = `${form.details.trim()}\n\n---\n${meta.join("\n")}`;

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: rest.join(" ") || "-",
          email: form.email.trim(),
          inquiryType,
          message,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("Enquiry sent", { type: form.type });
      setStatus("success");
      setForm(initial);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="request-box" onSubmit={handleSubmit} aria-describedby="concierge-status">
      <h3>Request a concierge</h3>
      <p>Share a few details. We&apos;ll review your request and get back to you.</p>

      <div className="field">
        <label htmlFor="cf-name">Your name</label>
        <input
          ref={nameRef}
          id="cf-name"
          name="name"
          required
          autoComplete="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label htmlFor="cf-whatsapp">
            WhatsApp <span className="opt">(optional)</span>
          </label>
          <input
            id="cf-whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            placeholder="+234…"
            value={form.whatsapp}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="cf-type">What do you need?</label>
          <select id="cf-type" name="type" value={form.type} onChange={handleChange}>
            {REQUEST_TYPES.map((t) => (
              <option key={t.label}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cf-when">When do you need it?</label>
          <input
            id="cf-when"
            name="when"
            placeholder="Date or timeframe"
            value={form.when}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="cf-details">Tell us about your request</label>
        <textarea
          id="cf-details"
          name="details"
          required
          placeholder="What would you like us to arrange?"
          value={form.details}
          onChange={handleChange}
        />
      </div>

      <button className="btn" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : <>Send concierge request <span className="arrow">↗</span></>}
      </button>

      <div id="concierge-status" role="status" aria-live="polite">
        {status === "success" && (
          <p className="form-status ok">
            Thank you. Your request has been received and our team will be in touch shortly.
          </p>
        )}
        {status === "error" && (
          <p className="form-status err">
            Something went wrong sending your request. Please try again, or reach us on WhatsApp.
          </p>
        )}
      </div>
      <p className="form-fine">We only use your details to respond to this request.</p>
    </form>
  );
}
