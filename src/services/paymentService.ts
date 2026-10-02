import { createEscrow } from "./escrowService";
import { auth } from "../lib/firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: new (options: unknown) => {
      open: () => void;
    };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;
const paymentApiBaseUrl =
  import.meta.env.VITE_PAYMENT_API_URL?.trim().replace(/\/+$/, "") || "";

const isFirebaseHosting = () => {
  const hostname = window.location.hostname;
  return hostname.endsWith(".web.app") || hostname.endsWith(".firebaseapp.com");
};

const shouldUseFirebaseFunctions = () => {
  const hostname = window.location.hostname;
  return (
    isFirebaseHosting() ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
};

const callPaymentApi = async <T>(
  endpoint: "create-order" | "verify",
  payload: unknown,
): Promise<T> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Sign in to continue with payment.");
  }

  // Local development can use callable Functions, but Firebase Hosting must
  // be given the Vercel deployment URL: it cannot serve Vercel API routes.
  if (isFirebaseHosting() && !paymentApiBaseUrl) {
    throw new Error(
      "Payment service is not configured. Set VITE_PAYMENT_API_URL to the Vercel deployment URL and redeploy the frontend.",
    );
  }

  if (!paymentApiBaseUrl && shouldUseFirebaseFunctions()) {
    const callableName =
      endpoint === "create-order" ? "createOrder" : "verifyRazorpayPayment";
    const callable = httpsCallable(functions, callableName);
    const callablePayload =
      endpoint === "create-order" && payload && typeof payload === "object"
        ? { ...payload, buyerId: currentUser.uid }
        : payload;
    const result = await callable(callablePayload);
    return result.data as T;
  }

  const idToken = await currentUser.getIdToken();
  const response = await fetch(
    `${paymentApiBaseUrl}/api/payments/${endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const result = (await response.json().catch(() => null)) as
    | { error?: string }
    | T
    | null;

  if (!response.ok) {
    const errorMessage =
      result && typeof result === "object" && "error" in result
        ? result.error
        : undefined;
    throw new Error(
      errorMessage || "Payment request failed. Please try again.",
    );
  }
  if (!result) throw new Error("Payment service returned an invalid response.");
  return result as T;
};

const loadRazorpayScript = async (): Promise<void> => {
  if (typeof window === "undefined") {
    throw new Error("Razorpay can only be loaded in the browser.");
  }

  if (window.Razorpay) {
    return;
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      const script = existingScript || document.createElement("script");

      if (!existingScript) {
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          reject(new Error("Unable to load Razorpay checkout script."));
        };
        document.body.appendChild(script);
      } else {
        script.onload = () => resolve();
        script.onerror = () => {
          reject(new Error("Unable to load Razorpay checkout script."));
        };
      }
    });
  }

  await razorpayScriptPromise;
};

export interface PaymentData {
  receipt: string;
  sellerId: string;
  booking: {
    date: string;
    time: string;
    duration: string;
    type: string;
    roomID: string;
  };
}

export interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifiedPayment {
  bookingId: string;
  bookingData: {
    lawyer: { id: string; name: string; specialty: string; fees: string };
    date: string;
    time: string;
    duration: string;
    type: string;
    fee: number;
    platformFee: number;
    gst: number;
    total: number;
    roomID: string;
  };
}

export const createRazorpayOrder = async (
  paymentData: PaymentData,
): Promise<OrderResponse> => {
  return callPaymentApi<OrderResponse>("create-order", paymentData);
};

export const initiateRazorpayPayment = async (
  order: OrderResponse,
  userDetails: {
    name: string;
    email: string;
    contact: string;
  },
): Promise<RazorpayPaymentResponse> => {
  const razorpayKeyId =
    order.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "";
  if (!razorpayKeyId) {
    throw new Error("Razorpay is not configured on the payment service.");
  }

  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: "LegalSangam",
      description: "Video consultation",
      order_id: order.orderId,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.contact,
      },
      theme: { color: "#2563eb" },
      handler: (response: RazorpayPaymentResponse) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      reject(error);
    }
  });
};

export const verifyRazorpayPayment = async (
  paymentResponse: RazorpayPaymentResponse,
): Promise<VerifiedPayment> => {
  return callPaymentApi<VerifiedPayment>("verify", paymentResponse);
};

export const handlePaymentSuccess = async (
  bookingData: unknown,
  userId: string,
) => {
  // Create escrow after successful payment
  const data = bookingData as { lawyer?: { id: string }; total: number };
  const escrowData = {
    clientId: userId,
    providerId: data.lawyer?.id || "lawyer_id",
    amount: data.total,
    status: "pending",
    milestones: [
      {
        description: "Consultation Payment",
        amount: data.total,
        status: "completed",
      },
    ],
  };

  await createEscrow(escrowData);
};
