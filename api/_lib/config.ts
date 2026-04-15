/**
 * Server-side configuration for Razorpay.
 * High-sensitivity: Contains live secret keys.
 */

export const RAZORPAY_CONFIG = {
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SYDe7YrQ4oRFim",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "0xcDRM2C5jg52ZYaua0UiKSN",
};

/**
 * Signature verification utility for Razorpay payments.
 */
import { createHmac } from "crypto";

export function verifyRazorpaySignature(
  orderId: string | null,
  paymentId: string,
  signature: string
): boolean {
  const secret = RAZORPAY_CONFIG.key_secret;
  if (!secret || !orderId) return false;

  const generated_signature = createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return generated_signature === signature;
}
