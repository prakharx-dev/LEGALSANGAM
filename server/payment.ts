import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";
import Razorpay from "razorpay";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export type BookingData = {
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

export class PaymentApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "PaymentApiError";
  }
}

let adminApp: App | undefined;
let razorpayClient: Razorpay | undefined;

export const getFirebaseAdminApp = (): App => {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!projectId || !databaseURL || !serviceAccountValue) {
    throw new PaymentApiError("Payment server is not configured.", 503);
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountValue) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (
      serviceAccount.project_id !== projectId ||
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {
      throw new Error(
        "Firebase service-account fields do not match the project.",
      );
    }

    adminApp =
      getApps().find((app) => app.name === "vercel-payment-api") ||
      initializeApp(
        {
          credential: cert({
            projectId,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
          }),
          projectId,
          databaseURL,
        },
        "vercel-payment-api",
      );
    return adminApp;
  } catch (error) {
    if (error instanceof PaymentApiError) throw error;
    throw new PaymentApiError("Firebase server credentials are invalid.", 503);
  }
};

export const getRazorpay = (): Razorpay => {
  if (razorpayClient) return razorpayClient;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new PaymentApiError(
      "Razorpay is not configured on the payment server.",
      503,
    );
  }
  razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayClient;
};

export const handleCors = (
  request: VercelRequest,
  response: VercelResponse,
): boolean => {
  const headerOrigin = request.headers.origin;
  const origin = Array.isArray(headerOrigin) ? headerOrigin[0] : headerOrigin;
  const configuredOrigins = (
    process.env.APP_ALLOWED_ORIGINS ||
    "https://legalsangamm.web.app,https://legalsangamm.firebaseapp.com,http://localhost:8080,http://localhost:8081,http://localhost:5173"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .filter((value): value is string => Boolean(value))
    .map((value) => (value.includes("://") ? value : `https://${value}`));
  const isLocalDevelopmentOrigin =
    Boolean(origin) &&
    !process.env.VERCEL &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");

  if (
    origin &&
    !isLocalDevelopmentOrigin &&
    ![...configuredOrigins, ...vercelOrigins].includes(origin)
  ) {
    response.status(403).json({ error: "This origin is not allowed." });
    return true;
  }

  if (origin) response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type",
  );

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return true;
  }
  return false;
};

export const requireUser = async (request: VercelRequest): Promise<string> => {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    throw new PaymentApiError("Sign in to continue with payment.", 401);
  }

  // Keep server configuration failures distinct from invalid/expired user
  // tokens so the client receives an actionable service error.
  const app = getFirebaseAdminApp();
  try {
    const decodedToken = await getAuth(app).verifyIdToken(
      authorization.slice("Bearer ".length),
    );
    return decodedToken.uid;
  } catch {
    throw new PaymentApiError(
      "Your sign-in session expired. Please sign in again.",
      401,
    );
  }
};

export const parseConsultationFee = (fees: unknown): number => {
  if (typeof fees !== "string") {
    throw new PaymentApiError("Advocate pricing is unavailable.", 409);
  }
  const feeMatch = fees.match(/\d[\d,]*/);
  const fee = feeMatch ? Number(feeMatch[0].replace(/,/g, "")) : 0;
  if (!Number.isSafeInteger(fee) || fee <= 0) {
    throw new PaymentApiError("Advocate pricing is invalid.", 409);
  }
  return fee;
};

export const sendPaymentError = (
  response: VercelResponse,
  error: unknown,
): void => {
  if (error instanceof PaymentApiError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }
  console.error(
    "Payment API request failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  response
    .status(500)
    .json({ error: "Payment service is temporarily unavailable." });
};

export const getPaymentStores = () => {
  const app = getFirebaseAdminApp();
  return {
    firestore: getFirestore(app),
    realtimeDatabase: getDatabase(app),
    serverTimestamp: FieldValue.serverTimestamp,
  };
};
