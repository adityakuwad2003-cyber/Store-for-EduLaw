/**
 * Verifies a coupon code via the backend API (avoids Firestore client-side restrictions).
 */
export async function verifyCoupon(code: string, subtotal: number): Promise<{
  valid: boolean;
  discount?: number;
  message?: string;
}> {
  try {
    const res = await fetch('/api/verify-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase().trim(), subtotal }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Coupon verification error:', error);
    return { valid: false, message: 'Verification service error' };
  }
}
