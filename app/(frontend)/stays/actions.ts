"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { startBooking, type BookingRequest } from "@/lib/bookings";
import { SITE_URL } from "@/lib/seo";
import { staysEnabled } from "@/lib/features";

/** Starts a booking and returns the Paystack checkout URL to redirect to. */
export async function bookStay(input: BookingRequest) {
  const h = await headers();
  // In production Paystack returns guests to the canonical site; locally, to wherever we're running.
  let origin = SITE_URL;
  if (process.env.NODE_ENV !== "production") {
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    origin = `${proto}://${host}`;
  }

  // Logged-in admins may test-book unpublished listings.
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: h });
  if (!staysEnabled() && !user) {
    return {
      ok: false as const,
      error: "Online booking isn't open yet. Please request your stay through our concierge form or WhatsApp.",
    };
  }

  return startBooking(input, {
    isAdmin: Boolean(user),
    callbackUrl: `${origin}/stays/confirmation`,
  });
}
