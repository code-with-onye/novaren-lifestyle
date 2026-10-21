"use client";

import { ENQUIRE_EVENT, type EnquireDetail, type RequestType } from "./site";

type Props = {
  item: string;
  type: RequestType;
  className?: string;
  children: React.ReactNode;
};

/** Prefills the concierge form with `item` and scrolls to it. */
export default function EnquireButton({ item, type, className = "btn", children }: Props) {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent<EnquireDetail>(ENQUIRE_EVENT, { detail: { item, type } }),
    );
    document.getElementById("concierge")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
