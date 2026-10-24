"use client";

import { useMemo, useState } from "react";
import { addDays, eachNight, formatDate } from "@/lib/dates";

type Props = {
  today: string;
  unavailable: string[];
  minNights: number;
  checkIn: string | null;
  checkOut: string | null;
  onChange: (range: { checkIn: string | null; checkOut: string | null }) => void;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;
const shiftMonth = (first: string, by: number) => {
  const [y, m] = first.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return d.toISOString().slice(0, 10);
};

/** Calendar cells for a month: leading blanks so weeks start on Monday, then each day. */
function monthCells(first: string): (string | null)[] {
  const [y, m] = first.split("-").map(Number);
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: days }, (_, i) => addDays(first, i)),
  ];
}

/**
 * Two-month (one on phones) date-range picker. A day is a "night": it can start a
 * stay if it's free; a stay can end on any later day as long as every night in
 * between is free and the minimum stay is met (check-out day itself may be booked).
 */
export default function RangeCalendar({ today, unavailable, minNights, checkIn, checkOut, onChange }: Props) {
  const taken = useMemo(() => new Set(unavailable), [unavailable]);
  const [first, setFirst] = useState(() => monthStart(checkIn ?? today));
  const lastAllowed = addDays(today, 365);

  // While picking check-out, find the first booked night after check-in: the stay can't cross it.
  const ceiling = useMemo(() => {
    if (!checkIn || checkOut) return null;
    for (let d = checkIn; d <= lastAllowed; d = addDays(d, 1)) if (taken.has(d)) return d;
    return null;
  }, [checkIn, checkOut, taken, lastAllowed]);

  const choosingCheckOut = Boolean(checkIn && !checkOut);

  const state = (day: string) => {
    const past = day < today || day > lastAllowed;
    if (choosingCheckOut && checkIn) {
      const valid = day > checkIn && (!ceiling || day <= ceiling) && eachNight(checkIn, day).length >= minNights;
      return { disabled: !valid && day !== checkIn, booked: taken.has(day) && day !== ceiling };
    }
    return { disabled: past || taken.has(day), booked: taken.has(day) };
  };

  const select = (day: string) => {
    if (choosingCheckOut && checkIn) {
      if (day === checkIn) return onChange({ checkIn: null, checkOut: null });
      return onChange({ checkIn, checkOut: day });
    }
    onChange({ checkIn: day, checkOut: null });
  };

  const months = [first, shiftMonth(first, 1)];
  const canGoBack = first > monthStart(today);

  return (
    <div className="cal">
      <div className="cal-nav">
        <button type="button" onClick={() => setFirst(shiftMonth(first, -1))} disabled={!canGoBack} aria-label="Previous month">
          ←
        </button>
        <button type="button" onClick={() => setFirst(shiftMonth(first, 1))} aria-label="Next month">
          →
        </button>
      </div>
      <div className="cal-months">
        {months.map((m, mi) => (
          <div key={m} className={`cal-month${mi === 1 ? " cal-month-second" : ""}`}>
            <div className="cal-title">{monthLabel.format(new Date(`${m}T00:00:00Z`))}</div>
            <div className="cal-grid" role="grid">
              {WEEKDAYS.map((w) => (
                <span key={w} className="cal-weekday" aria-hidden="true">
                  {w}
                </span>
              ))}
              {monthCells(m).map((day, i) => {
                if (!day) return <span key={`b${i}`} />;
                const { disabled, booked } = state(day);
                const isStart = day === checkIn;
                const isEnd = day === checkOut;
                const inRange = Boolean(checkIn && checkOut && day > checkIn && day < checkOut);
                const cls = [
                  "cal-day",
                  isStart && "is-start",
                  isEnd && "is-end",
                  inRange && "in-range",
                  booked && "is-booked",
                  day === today && "is-today",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={day}
                    type="button"
                    className={cls}
                    disabled={disabled && !isStart}
                    aria-pressed={isStart || isEnd}
                    aria-label={`${formatDate(day)}${booked ? ", unavailable" : ""}`}
                    onClick={() => select(day)}
                  >
                    {Number(day.slice(8))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="cal-hint" aria-live="polite">
        {!checkIn
          ? "Select your check-in date."
          : !checkOut
            ? `Now select check-out${minNights > 1 ? ` (minimum ${minNights} nights)` : ""}.`
            : `${eachNight(checkIn, checkOut).length} nights selected.`}
      </p>
    </div>
  );
}
