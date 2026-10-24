"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/dates";

export type StayCard = {
  id: string;
  slug: string;
  name: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  nightlyRate: number;
  minNights: number;
  cover: { url: string; alt: string } | null;
};

type Sort = "recommended" | "price-asc" | "price-desc";

// Option text describes itself, so the selects read clearly without labels on phones.
const BEDROOM_OPTIONS = [
  { value: "any", label: "Any beds" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1 bed" },
  { value: "2", label: "2 beds" },
  { value: "3", label: "3+ beds" },
];

const beds = (n: number) => (n === 0 ? "Studio" : `${n} bed`);

export default function StaysBrowser({ stays }: { stays: StayCard[] }) {
  const areas = useMemo(() => [...new Set(stays.map((s) => s.area))].sort(), [stays]);
  const maxGuests = useMemo(() => Math.max(1, ...stays.map((s) => s.maxGuests)), [stays]);
  const [area, setArea] = useState("all");
  const [bedrooms, setBedrooms] = useState("any");
  const [guests, setGuests] = useState(1);
  const [sort, setSort] = useState<Sort>("recommended");

  const shown = useMemo(() => {
    const list = stays.filter(
      (s) =>
        (area === "all" || s.area === area) &&
        (bedrooms === "any" || (bedrooms === "3" ? s.bedrooms >= 3 : s.bedrooms === Number(bedrooms))) &&
        s.maxGuests >= guests,
    );
    if (sort === "price-asc") list.sort((a, b) => a.nightlyRate - b.nightlyRate);
    if (sort === "price-desc") list.sort((a, b) => b.nightlyRate - a.nightlyRate);
    return list;
  }, [stays, area, bedrooms, guests, sort]);

  const filtered = area !== "all" || bedrooms !== "any" || guests > 1;
  const reset = () => {
    setArea("all");
    setBedrooms("any");
    setGuests(1);
  };

  return (
    <>
      <div className="stays-bar">
        <div className="stays-bar-inner">
          {areas.length > 1 && (
            <div className="stays-chips" role="group" aria-label="Area">
              {["all", ...areas].map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`chip${area === a ? " is-on" : ""}`}
                  aria-pressed={area === a}
                  onClick={() => setArea(a)}
                >
                  {a === "all" ? "All areas" : a}
                </button>
              ))}
            </div>
          )}
          <div className="stays-filters">
            <label>
              <span className="sr-only">Bedrooms</span>
              <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                {BEDROOM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Guests</span>
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? "Any guests" : `${n}+ guests`}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="recommended">Featured</option>
                <option value="price-asc">Lowest price</option>
                <option value="price-desc">Highest price</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="stays-results container">
        <p className="stays-count" aria-live="polite">
          {shown.length} {shown.length === 1 ? "apartment" : "apartments"}
          {filtered && (
            <button type="button" className="text-link" onClick={reset}>
              Clear filters
            </button>
          )}
        </p>

        {shown.length === 0 ? (
          <div className="stays-empty">
            <h2>No apartments match those filters.</h2>
            <p>Try another area or fewer bedrooms, or tell us what you need and we&apos;ll find it.</p>
            <button type="button" className="btn" onClick={reset}>
              Show all apartments
            </button>
          </div>
        ) : (
          <ul className="stays-grid">
            {shown.map((s, i) => (
              <li key={s.id}>
                <Link href={`/stays/${s.slug}`} className="stay-tile">
                  <div className="stay-tile-img">
                    {s.cover && (
                      <Image
                        src={s.cover.url}
                        alt={s.cover.alt}
                        fill
                        priority={i < 4}
                        sizes="(max-width: 600px) 132px, (max-width: 1000px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    )}
                    <span className="stay-tile-area">{s.area}</span>
                  </div>
                  <div className="stay-tile-body">
                    <span className="stay-tile-kicker">{s.area}</span>
                    <h2>{s.name}</h2>
                    <p className="stay-tile-facts">
                      {beds(s.bedrooms)} · {s.bathrooms} bath · {s.maxGuests} {s.maxGuests === 1 ? "guest" : "guests"}
                    </p>
                    <p className="stay-tile-price">
                      <strong>{formatNaira(s.nightlyRate)}</strong> / night
                      {s.minNights > 1 && <span> · min {s.minNights} nights</span>}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
