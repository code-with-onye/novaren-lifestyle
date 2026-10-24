"use client";

import { useMemo, useState } from "react";
import { addDays, formatDate, nightsBetween } from "@/lib/dates";

type Range = { checkIn: string | null; checkOut: string | null };

type Props = Range & {
  today: string;
  unavailable: string[];
  minNights: number;
  onChange: (range: Range) => void;
};

type Editing = "checkIn" | "checkOut";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const fmtShort = (iso: string) => shortDate.format(new Date(`${iso}T00:00:00Z`));

const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;
const shiftMonth = (first: string, by: number) => {
  const [y, m] = first.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + by, 1)).toISOString().slice(0, 10);
};

/** Calendar cells for a month: leading blanks so weeks start on Monday, then each day. */
function monthCells(first: string): (string | null)[] {
  const [y, m] = first.split("-").map(Number);
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [...Array<null>(offset).fill(null), ...Array.from({ length: days }, (_, i) => addDays(first, i))];
}

/**
 * Date-range picker that behaves like familiar booking sites. Each day is a night:
 * a stay can start on any free night and end on a later day, as long as every
 * night in between is free and the minimum stay is met. Tapping a date that
 * can't end the current stay starts a new one there instead of being ignored.
 */
export default function RangeCalendar({ today, unavailable, minNights, checkIn, checkOut, onChange }: Props) {
  const taken = useMemo(() => new Set(unavailable), [unavailable]);
  const lastNight = addDays(today, 365);
  const [first, setFirst] = useState(() => monthStart(checkIn ?? today));
  const [editing, setEditing] = useState<Editing>(checkIn && !checkOut ? "checkOut" : "checkIn");
  const [hover, setHover] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isFreeNight = (d: string) => d >= today && d <= lastNight && !taken.has(d);

  /** The first booked night after `from`: a stay starting at `from` must end on or before it. */
  const ceilingFor = (from: string) => {
    for (let d = addDays(from, 1); d <= lastNight; d = addDays(d, 1)) if (taken.has(d)) return d;
    return addDays(lastNight, 1);
  };

  const ceiling = checkIn ? ceilingFor(checkIn) : null;

  const isValidCheckOut = (from: string, d: string, limit = ceilingFor(from)) =>
    d > from && d <= limit && nightsBetween(from, d) >= minNights;

  const choosingCheckOut = editing === "checkOut" && Boolean(checkIn);

  const startStay = (day: string) => {
    // Keep the existing check-out if it still makes a valid stay from the new check-in.
    const keep = checkOut && isValidCheckOut(day, checkOut) ? checkOut : null;
    onChange({ checkIn: day, checkOut: keep });
    setEditing(keep ? "checkIn" : "checkOut");
  };

  const select = (day: string) => {
    setNotice(null);
    if (choosingCheckOut && checkIn) {
      if (day === checkIn) {
        onChange({ checkIn: null, checkOut: null });
        setEditing("checkIn");
        return;
      }
      if (isValidCheckOut(checkIn, day, ceiling!)) {
        onChange({ checkIn, checkOut: day });
        setEditing("checkIn");
        setHover(null);
        return;
      }
      if (day > checkIn && day <= ceiling! && nightsBetween(checkIn, day) < minNights) {
        setNotice(`Minimum stay is ${minNights} nights. Choose a later check-out.`);
        return;
      }
      // Before check-in or past a booked night: start a new stay from here.
    }
    if (isFreeNight(day)) startStay(day);
  };

  const clear = () => {
    onChange({ checkIn: null, checkOut: null });
    setEditing("checkIn");
    setNotice(null);
  };

  // Range shown on the grid: the selection, or a hover preview while choosing check-out.
  const previewEnd =
    choosingCheckOut && checkIn && hover && isValidCheckOut(checkIn, hover, ceiling!) ? hover : null;
  const rangeEnd = checkOut ?? previewEnd;

  const dayState = (day: string) => {
    const outside = day < today || day > addDays(lastNight, 1);
    const booked = taken.has(day);
    if (choosingCheckOut && checkIn) {
      if (day === checkIn) return { disabled: false, booked: false, short: false };
      const canEnd = isValidCheckOut(checkIn, day, ceiling!);
      const tooShort = day > checkIn && day <= ceiling! && !canEnd;
      // A booked night is only usable here as the check-out morning.
      const disabled = outside || (booked && !canEnd) || (!canEnd && !tooShort && !isFreeNight(day));
      return { disabled, booked: booked && !canEnd, short: tooShort };
    }
    return { disabled: outside || !isFreeNight(day), booked, short: false };
  };

  const months = [first, shiftMonth(first, 1)];
  const canGoBack = first > monthStart(today);
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  const hint =
    notice ??
    (!checkIn
      ? "Select your check-in date."
      : choosingCheckOut
        ? `Now select check-out${minNights > 1 ? ` (minimum ${minNights} nights)` : ""}.`
        : `${nights} ${nights === 1 ? "night" : "nights"} selected.`);

  return (
    <div className="cal">
      <div className="cal-fields">
        <button
          type="button"
          className={`cal-field${!choosingCheckOut ? " is-active" : ""}`}
          onClick={() => {
            setEditing("checkIn");
            setNotice(null);
          }}
        >
          <span>Check-in</span>
          <strong>{checkIn ? fmtShort(checkIn) : "Add date"}</strong>
        </button>
        <button
          type="button"
          className={`cal-field${choosingCheckOut ? " is-active" : ""}`}
          disabled={!checkIn}
          onClick={() => {
            setEditing("checkOut");
            setNotice(null);
          }}
        >
          <span>Check-out</span>
          <strong>{checkOut ? fmtShort(checkOut) : "Add date"}</strong>
        </button>
      </div>

      <div className="cal-head">
        <div className="cal-nav">
          <button type="button" onClick={() => setFirst(shiftMonth(first, -1))} disabled={!canGoBack} aria-label="Previous month">
            ←
          </button>
          <button
            type="button"
            onClick={() => setFirst(shiftMonth(first, 1))}
            disabled={shiftMonth(first, 1) > monthStart(lastNight)}
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="cal-months" onMouseLeave={() => setHover(null)}>
        {months.map((m, mi) => (
          <div key={m} className={`cal-month${mi === 1 ? " cal-month-second" : ""}`}>
            <div className="cal-title">{monthLabel.format(new Date(`${m}T00:00:00Z`))}</div>
            <div className="cal-grid">
              {WEEKDAYS.map((w) => (
                <span key={w} className="cal-weekday" aria-hidden="true">
                  {w}
                </span>
              ))}
              {monthCells(m).map((day, i) => {
                if (!day) return <span key={`b${i}`} />;
                const { disabled, booked, short } = dayState(day);
                const isStart = day === checkIn;
                const isEnd = day === rangeEnd;
                const inRange = Boolean(checkIn && rangeEnd && day > checkIn && day < rangeEnd);
                const cls = [
                  "cal-day",
                  isStart && "is-start",
                  isEnd && (checkOut ? "is-end" : "is-end preview"),
                  inRange && (checkOut ? "in-range" : "in-range preview"),
                  booked && "is-booked",
                  short && "is-short",
                  day === today && "is-today",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={day}
                    type="button"
                    className={cls}
                    disabled={disabled}
                    aria-pressed={isStart || day === checkOut}
                    aria-label={`${formatDate(day)}${booked ? ", unavailable" : ""}${short ? `, below the ${minNights}-night minimum` : ""}`}
                    onClick={() => select(day)}
                    onMouseEnter={() => choosingCheckOut && setHover(day)}
                  >
                    {Number(day.slice(8))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="cal-foot">
        <p className={`cal-hint${notice ? " is-notice" : ""}`} aria-live="polite">
          {hint}
        </p>
        {checkIn && (
          <button type="button" className="cal-clear" onClick={clear}>
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
