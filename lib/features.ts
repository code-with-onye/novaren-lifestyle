// Feature switches, read on the server.

/**
 * Online shortlet booking (/stays, Paystack checkout). Off in production until
 * STAYS_BOOKING_ENABLED=true is set (with live Paystack keys); on in development
 * unless explicitly set to "false". Changing it in production needs a redeploy.
 */
export function staysEnabled(): boolean {
  const flag = process.env.STAYS_BOOKING_ENABLED;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}
