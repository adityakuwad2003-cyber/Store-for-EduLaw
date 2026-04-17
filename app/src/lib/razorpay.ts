// Razorpay Frontend Integration

// Learn How To Get Your Keys: https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface CheckoutOptions {
  amount: number; // in paise (e.g., 50000 for ₹500.00)
  currency: string;
  name: string;
  description: string;
  order_id?: string; // Replace with an Order ID generated from your backend later
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

export const initializeRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Prevent duplicate scripts
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayCheckout = async (options: CheckoutOptions) => {
  const isLoaded = await initializeRazorpay();
  
  if (!isLoaded) {
    alert("Razorpay SDK failed to load. Are you online?");
    return;
  }

  const finalOptions = {
    ...options,
    key: RAZORPAY_KEY,
  };

  const paymentObject = new (window as any).Razorpay(finalOptions);
  paymentObject.open();
};
