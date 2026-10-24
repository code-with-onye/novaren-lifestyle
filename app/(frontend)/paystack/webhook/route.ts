import { confirmBooking } from "@/lib/bookings";
import { isValidWebhookSignature } from "@/lib/paystack";

// Paystack calls this when a payment succeeds, even if the guest closed their
// browser before returning to the site. Set it in the Paystack dashboard as:
//   https://<your-domain>/paystack/webhook
export async function POST(request: Request) {
  const raw = await request.text();
  if (!isValidWebhookSignature(raw, request.headers.get("x-paystack-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    // confirmBooking re-verifies with Paystack's API, so the webhook body is never trusted on its own.
    await confirmBooking(event.data.reference);
  }
  return new Response("ok");
}
