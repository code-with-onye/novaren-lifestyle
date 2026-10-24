import 'server-only';
import crypto from 'node:crypto';

// Thin wrapper around the Paystack REST API. Amounts are in naira here and
// converted to kobo for Paystack. Docs: https://paystack.com/docs/api/transaction/

const API = 'https://api.paystack.co';

const secretKey = () => process.env.PAYSTACK_SECRET_KEY ?? '';

export const paystackConfigured = () => secretKey().startsWith('sk_');

type InitializeInput = {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export async function initializeTransaction(input: InitializeInput): Promise<{ authorizationUrl: string }> {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNaira * 100),
      currency: 'NGN',
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: 'no-store',
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.status || !body?.data?.authorization_url) {
    throw new Error(`Paystack initialize failed (${res.status}): ${body?.message ?? 'no message'}`);
  }
  return { authorizationUrl: body.data.authorization_url };
}

export type VerifiedTransaction = {
  status: 'success' | 'failed' | 'abandoned' | 'ongoing' | 'pending' | string;
  amountNaira: number;
  currency: string;
  paidAt: string | null;
  transactionId: string;
  channel: string;
};

export async function verifyTransaction(reference: string): Promise<VerifiedTransaction | null> {
  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.status || !body?.data) return null;
  const d = body.data;
  return {
    status: d.status,
    amountNaira: Number(d.amount) / 100,
    currency: d.currency,
    paidAt: d.paid_at ?? d.paidAt ?? null,
    transactionId: String(d.id),
    channel: d.channel ?? '',
  };
}

/** Webhooks are signed with HMAC-SHA512 of the raw body using the secret key. */
export function isValidWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !paystackConfigured()) return false;
  const expected = crypto.createHmac('sha512', secretKey()).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
