"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Records a Umami event when rendered. With `onceKey`, it's recorded at most
 * once per browser session (e.g. a refreshed confirmation page isn't double-counted).
 */
export default function TrackEvent({
  name,
  data,
  onceKey,
}: {
  name: string;
  data?: Record<string, string | number | boolean>;
  onceKey?: string;
}) {
  useEffect(() => {
    if (onceKey) {
      try {
        if (sessionStorage.getItem(onceKey)) return;
        sessionStorage.setItem(onceKey, "1");
      } catch {
        // Storage unavailable: record anyway.
      }
    }
    track(name, data);
    // Fire once per mount; `data` is a fresh object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, onceKey]);

  return null;
}
