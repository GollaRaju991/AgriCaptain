// Centralized discount logic for Cart, Checkout, and MobileCheckoutFlow

export interface CouponDef {
  type: 'percent';
  value: number;
  minOrder: number;
  label: string;
  requiresUPI?: boolean;
  firstTimeOnly?: boolean;
}

export const COUPONS: Record<string, CouponDef> = {
  SAVE10: { type: 'percent', value: 10, minOrder: 1000, label: '10% off on orders above ₹1000' },
  FIRST20: { type: 'percent', value: 20, minOrder: 0, label: '20% off for first time buyers', firstTimeOnly: true },
  UPI10: { type: 'percent', value: 10, minOrder: 0, label: 'Extra 10% off with UPI payment', requiresUPI: true },
};

export interface DiscountResult {
  couponDiscount: number;
  upiDiscount: number;
  finalTotal: number;
}

/**
 * Calculate discounts in the correct order:
 * 1. Subtotal
 * 2. Apply coupon discount (if valid)
 * 3. Apply UPI discount (10%) ONLY if UPI payment method selected, on post-coupon amount
 * 4. Final total
 */
export function calculateDiscounts(
  subtotal: number,
  appliedCoupon: string | null,
  paymentMethod: string
): DiscountResult {
  // Step 1: Calculate coupon discount on subtotal
  let couponDiscount = 0;
  if (appliedCoupon && COUPONS[appliedCoupon]) {
    const coupon = COUPONS[appliedCoupon];
    couponDiscount = Math.round(subtotal * (coupon.value / 100));
  }

  // Step 2: Amount after coupon
  const afterCoupon = Math.max(0, subtotal - couponDiscount);

  // Step 3: UPI discount (10%) only if UPI selected
  const upiDiscount = paymentMethod === 'upi' ? Math.round(afterCoupon * 0.1) : 0;

  // Step 4: Final total
  const finalTotal = Math.max(0, afterCoupon - upiDiscount);

  return { couponDiscount, upiDiscount, finalTotal };
}

/**
 * Validate a coupon code against conditions
 */
export function validateCoupon(
  code: string,
  subtotal: number,
  paymentMethod: string,
  isFirstTimeUser: boolean = false
): { valid: boolean; error?: string } {
  const coupon = COUPONS[code];
  if (!coupon) {
    return { valid: false, error: `"${code}" is not a valid coupon code.` };
  }
  if (subtotal < coupon.minOrder) {
    return { valid: false, error: `This coupon requires a minimum order of ₹${coupon.minOrder}.` };
  }
  if (coupon.requiresUPI && paymentMethod !== 'upi') {
    return { valid: false, error: 'This coupon is valid only with UPI payment method.' };
  }
  if (coupon.firstTimeOnly && !isFirstTimeUser) {
    // For now, allow first-time coupon (we can't verify server-side in cart)
    // In production, this should be validated server-side
  }
  return { valid: true };
}
