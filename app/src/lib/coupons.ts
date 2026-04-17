/**
 * Verifies a coupon code via the backend API (avoids Firestore client-side restrictions).
 */
export async function verifyCoupon(code: string, subtotal: number, userId?: string): Promise<{
  valid: boolean;
  discount?: number;
  message?: string;
}> {
  try {
    const res = await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify-coupon', code: code.toUpperCase().trim(), subtotal, userId }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Coupon verification error:', error);
    return { valid: false, message: 'Verification service error' };
  }
}
