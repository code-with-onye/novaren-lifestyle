// Custom events for Umami (https://umami.is/docs/tracker-functions). Safe to call
// from client code at any time: if the tracker script hasn't loaded yet, the
// event is retried briefly instead of being lost. No-ops on the server.

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void };
  }
}

export function track(event: string, data?: EventData, attempt = 0) {
  if (typeof window === "undefined") return;
  try {
    if (window.umami) {
      window.umami.track(event, data);
    } else if (attempt < 20) {
      window.setTimeout(() => track(event, data, attempt + 1), 250);
    }
  } catch {
    // Analytics must never break the page (ad blockers, network errors…).
  }
}
