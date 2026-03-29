/* Razorpay payment gateway utilities */
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentOptions {
  amount: number; // in INR (will be converted to paise)
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
}

export interface RazorpayPaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

const RAZORPAY_KEY_ID = 'rzp_live_SX4NYEslAbwwUn';

export const openRazorpayCheckout = (
  options: RazorpayPaymentOptions
): Promise<RazorpayPaymentResult> => {
  return new Promise((resolve) => {
    if (!window.Razorpay) {
      resolve({ success: false, error: 'Razorpay SDK not loaded. Please refresh and try again.' });
      return;
    }

    const rzpOptions = {
      key: RAZORPAY_KEY_ID,
      amount: options.amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Agrizin',
      description: options.description || 'Product Payment',
      image: '/favicon.png',
      prefill: {
        name: options.customerName || '',
        email: options.customerEmail || '',
        contact: options.customerPhone || '',
      },
      theme: {
        color: '#16a34a',
      },
      handler: function (response: any) {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id || '',
          signature: response.razorpay_signature || '',
        });
      },
      modal: {
        ondismiss: function () {
          resolve({ success: false, error: 'Payment cancelled by user' });
        },
        escape: true,
        confirm_close: true,
      },
    };

    try {
      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', function (response: any) {
        resolve({
          success: false,
          error: response.error?.description || 'Payment failed',
        });
      });
      rzp.open();
    } catch (err: any) {
      resolve({ success: false, error: err?.message || 'Failed to open payment gateway' });
    }
  });
};
