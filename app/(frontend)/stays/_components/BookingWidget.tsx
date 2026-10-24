"use client";

import { useState, useTransition } from "react";
import { eachNight, formatDate, formatNaira } from "@/lib/dates";
import { bookStay } from "../actions";
import RangeCalendar from "./RangeCalendar";
import { track } from "@/lib/analytics";

type Props = {
  apartmentId: string;
  apartmentName: string;
  nightlyRate: number;
  cautionDeposit: number;
  minNights: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  today: string;
  unavailable: string[];
};

export default function BookingWidget(props: Props) {
  const [range, setRange] = useState<{ checkIn: string | null; checkOut: string | null }>({
    checkIn: null,
    checkOut: null,
  });
  const [guests, setGuests] = useState(Math.min(2, props.maxGuests));
  const [step, setStep] = useState<"dates" | "details">("dates");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const nights = range.checkIn && range.checkOut ? eachNight(range.checkIn, range.checkOut).length : 0;
  const stay = nights * props.nightlyRate;
  const total = stay + props.cautionDeposit;

  const onField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!range.checkIn || !range.checkOut) return;
    setError(null);
    track("Booking started", { apartment: props.apartmentName, nights, total });
    startTransition(async () => {
      const res = await bookStay({
        apartmentId: props.apartmentId,
        checkIn: range.checkIn!,
        checkOut: range.checkOut!,
        guests,
        ...form,
      });
      if (res.ok) {
        window.location.assign(res.url);
      } else {
        setError(res.error);
        if (/nights|dates|minimum|past/i.test(res.error)) setStep("dates");
      }
    });
  };

  return (
    <div className="book-card">
      <div className="book-price">
        <strong>{formatNaira(props.nightlyRate)}</strong> <span>/ night</span>
      </div>

      {step === "dates" ? (
        <>
          <RangeCalendar
            today={props.today}
            unavailable={props.unavailable}
            minNights={props.minNights}
            checkIn={range.checkIn}
            checkOut={range.checkOut}
            onChange={(r) => {
              setRange(r);
              setError(null);
            }}
          />

          <div className="field book-guests">
            <label htmlFor="bk-guests">Guests</label>
            <select id="bk-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
              {Array.from({ length: props.maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </div>

          {nights > 0 && (
            <dl className="book-breakdown">
              <div>
                <dt>
                  {formatNaira(props.nightlyRate)} × {nights} {nights === 1 ? "night" : "nights"}
                </dt>
                <dd>{formatNaira(stay)}</dd>
              </div>
              {props.cautionDeposit > 0 && (
                <div>
                  <dt>
                    Caution deposit <small>refundable</small>
                  </dt>
                  <dd>{formatNaira(props.cautionDeposit)}</dd>
                </div>
              )}
              <div className="book-total">
                <dt>Total</dt>
                <dd>{formatNaira(total)}</dd>
              </div>
            </dl>
          )}

          {error && <p className="form-status err">{error}</p>}

          <button
            type="button"
            className="btn book-cta"
            disabled={!nights}
            onClick={() => {
              setError(null);
              setStep("details");
            }}
          >
            {nights ? "Continue" : "Choose your dates"}
          </button>
          <p className="book-fine">
            Check-in from {props.checkInTime} · check-out by {props.checkOutTime}
          </p>
        </>
      ) : (
        <form onSubmit={pay}>
          <button type="button" className="book-back" onClick={() => setStep("dates")}>
            ← Change dates
          </button>
          <p className="book-summary">
            {formatDate(range.checkIn!)} → {formatDate(range.checkOut!)}
            <br />
            {nights} {nights === 1 ? "night" : "nights"} · {guests} {guests === 1 ? "guest" : "guests"}
          </p>

          <div className="field">
            <label htmlFor="bk-name">Full name</label>
            <input id="bk-name" name="name" required autoComplete="name" value={form.name} onChange={onField} />
          </div>
          <div className="field">
            <label htmlFor="bk-email">Email</label>
            <input id="bk-email" name="email" type="email" required autoComplete="email" value={form.email} onChange={onField} />
          </div>
          <div className="field">
            <label htmlFor="bk-phone">Phone / WhatsApp</label>
            <input id="bk-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+234…" value={form.phone} onChange={onField} />
          </div>
          <div className="field">
            <label htmlFor="bk-notes">
              Anything we should know? <span className="opt">(optional)</span>
            </label>
            <textarea id="bk-notes" name="notes" rows={3} maxLength={1000} value={form.notes} onChange={onField} />
          </div>

          {error && (
            <p className="form-status err" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn book-cta" disabled={pending}>
            {pending ? "Opening secure payment…" : `Pay ${formatNaira(total)}`}
          </button>
          <p className="book-fine">
            Secure payment by Paystack (card, bank transfer or USSD).
            {props.cautionDeposit > 0 && " The caution deposit is refunded after check-out."}
          </p>
        </form>
      )}
    </div>
  );
}
