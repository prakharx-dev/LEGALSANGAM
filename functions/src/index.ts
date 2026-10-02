import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import Razorpay from "razorpay";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp({
  databaseURL:
    "https://prakharx-4c900-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const getRequiredSecret = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `${name} is not configured`,
    );
  }
  return value;
};

// Runtime config (`functions.config()`) was retired by Firebase in March 2026.
// Deploy-time variables now come from functions/.env (or Secret Manager), and
// are exposed to the function through process.env.
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayClient: Razorpay | undefined;
const getRazorpay = (): Razorpay => {
  if (razorpayClient) return razorpayClient;
  const keyId = getRequiredSecret(razorpayKeyId, "RAZORPAY_KEY_ID");
  const keySecret = getRequiredSecret(razorpayKeySecret, "RAZORPAY_KEY_SECRET");
  razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayClient;
};

const db = admin.database();

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
};

type RazorpayBooking = {
  lawyer: {
    id: string;
    name: string;
    specialty: string;
    fees: string;
  };
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

type EscrowPayment = {
  id: string | null;
  [key: string]: unknown;
};

export const createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated",
    );
  }

  const { receipt, buyerId, sellerId, booking } = data as {
    receipt?: string;
    buyerId: string;
    sellerId: string;
    booking: Pick<
      RazorpayBooking,
      "date" | "time" | "duration" | "type" | "roomID"
    >;
  };

  if (buyerId !== context.auth.uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "buyerId must match authenticated user",
    );
  }

  if (
    !sellerId ||
    !booking ||
    !booking.date ||
    !booking.time ||
    !booking.roomID ||
    booking.type !== "Video consultation" ||
    booking.duration !== "60 minutes"
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid video consultation booking is required",
    );
  }

  try {
    getRequiredSecret(razorpayKeyId, "RAZORPAY_KEY_ID");
    getRequiredSecret(razorpayKeySecret, "RAZORPAY_KEY_SECRET");

    const lawyerSnapshot = await admin
      .firestore()
      .collection("lawyers")
      .doc(String(sellerId))
      .get();
    if (!lawyerSnapshot.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Advocate pricing is unavailable for this profile.",
      );
    }

    const lawyer = lawyerSnapshot.data();
    const feeDigits =
      typeof lawyer?.fees === "string" ? lawyer.fees.match(/\d+/g) : null;
    if (!feeDigits || lawyer?.available === false) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "This advocate is unavailable for video bookings.",
      );
    }

    const consultationFee = Number(feeDigits.join(""));
    if (!Number.isSafeInteger(consultationFee) || consultationFee <= 0) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Advocate pricing is invalid.",
      );
    }
    const platformFee = Math.round(consultationFee * 0.08);
    const gst = Math.round((consultationFee + platformFee) * 0.18);
    const total = consultationFee + platformFee + gst;
    const amountPaise = total * 100;
    const bookingData: RazorpayBooking = {
      lawyer: {
        id: String(sellerId),
        name: String(lawyer?.name || "Advocate"),
        specialty: String(lawyer?.specialty || "General Law"),
        fees: String(lawyer?.fees),
      },
      date: booking.date,
      time: booking.time,
      duration: "60 minutes",
      type: "Video consultation",
      fee: consultationFee,
      platformFee,
      gst,
      total,
      roomID: booking.roomID,
    };

    const order = (await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: receipt?.slice(0, 40) || `consult-${Date.now()}`,
      payment_capture: true, // Auto capture
      notes: {
        buyerId,
        sellerId: String(sellerId),
        roomID: booking.roomID,
        date: booking.date,
        time: booking.time,
      },
    })) as RazorpayOrder;

    await db.ref("escrowTransactions").push({
      orderId: order.id,
      buyerId,
      sellerId: String(sellerId),
      amount: total,
      amountPaise,
      currency: "INR",
      bookingData,
      status: "created",
      createdAt: admin.database.ServerValue.TIMESTAMP,
      lastUpdate: admin.database.ServerValue.TIMESTAMP,
      payment: order,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "Failed to create order");
  }
});

export const verifyRazorpayPayment = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
      );
    }

    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = data;
    if (
      typeof orderId !== "string" ||
      typeof paymentId !== "string" ||
      typeof signature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(signature)
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid Razorpay payment details",
      );
    }

    const serverSecret = getRequiredSecret(
      razorpayKeySecret,
      "RAZORPAY_KEY_SECRET",
    );
    const expectedSignature = crypto
      .createHmac("sha256", serverSecret)
      .update(`${orderId}|${paymentId}`)
      .digest();
    const receivedSignature = Buffer.from(signature, "hex");
    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Razorpay payment signature is invalid",
      );
    }

    try {
      const orderSnapshot = await db
        .ref("escrowTransactions")
        .orderByChild("orderId")
        .equalTo(orderId)
        .once("value");
      if (!orderSnapshot.exists()) {
        throw new functions.https.HttpsError(
          "not-found",
          "Payment order not found",
        );
      }

      const orderEntries = Object.entries(orderSnapshot.val()) as [
        string,
        {
          buyerId: string;
          amountPaise: number;
          currency: string;
          status: string;
          bookingData: RazorpayBooking;
        },
      ][];
      const [transactionKey, transaction] = orderEntries[0];
      if (transaction.buyerId !== context.auth.uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Payment order does not belong to this user",
        );
      }

      const payment = (await getRazorpay().payments.fetch(paymentId)) as {
        order_id: string;
        amount: number;
        currency: string;
        status: string;
      };
      if (
        payment.order_id !== orderId ||
        payment.amount !== transaction.amountPaise ||
        payment.currency !== transaction.currency ||
        payment.status !== "captured"
      ) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Payment is not captured for the expected amount",
        );
      }

      const bookingRef = admin.firestore().collection("bookings").doc(orderId);
      await admin.firestore().runTransaction(async (firestoreTransaction) => {
        const existingBooking = await firestoreTransaction.get(bookingRef);
        if (existingBooking.exists) {
          const existingData = existingBooking.data();
          if (
            existingData?.clientId === context.auth!.uid &&
            existingData?.paymentId === paymentId
          ) {
            return;
          }
          throw new functions.https.HttpsError(
            "already-exists",
            "This payment order is already linked to another booking.",
          );
        }

        firestoreTransaction.create(bookingRef, {
          clientId: context.auth!.uid,
          lawyerId: transaction.bookingData.lawyer.id,
          lawyerName: transaction.bookingData.lawyer.name,
          specialty: transaction.bookingData.lawyer.specialty,
          ...transaction.bookingData,
          paymentProvider: "razorpay",
          paymentOrderId: orderId,
          paymentId,
          status: "confirmed",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await db.ref(`escrowTransactions/${transactionKey}`).update({
        status: "captured",
        payment: {
          id: paymentId,
          orderId,
          amount: payment.amount,
          currency: payment.currency,
        },
        lastUpdate: admin.database.ServerValue.TIMESTAMP,
      });

      return {
        success: true,
        bookingId: orderId,
        bookingData: transaction.bookingData,
      };
    } catch (error) {
      console.error("Razorpay payment verification failed:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError(
        "internal",
        "Unable to verify Razorpay payment",
      );
    }
  },
);

export const razorpayWebhook = functions.https.onRequest(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500).send("Webhook secret not configured");
    return;
  }

  const signatureHeader = req.headers["x-razorpay-signature"];
  if (typeof signatureHeader !== "string") {
    res.status(400).send("Missing Razorpay signature");
    return;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const signatureBuffer = Buffer.from(signatureHeader, "hex");
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    console.error("Invalid signature");
    res.status(400).send("Invalid signature");
    return;
  }

  const event = req.body.event;
  const paymentEntity = req.body.payload.payment.entity;

  try {
    const escrowRef = db
      .ref("escrowTransactions")
      .orderByChild("orderId")
      .equalTo(paymentEntity.order_id);
    const snapshot = await escrowRef.once("value");
    if (!snapshot.exists()) {
      console.error("Escrow not found for order:", paymentEntity.order_id);
      res.status(404).send("Escrow not found");
      return;
    }

    const escrowKey = Object.keys(snapshot.val())[0];
    const escrowData = snapshot.val()[escrowKey];

    let newStatus = escrowData.status;
    if (event === "payment.authorized") {
      newStatus = "authorized";
    } else if (event === "payment.captured") {
      newStatus = "captured";
    } else if (event === "payment.failed") {
      newStatus = "failed";
    }

    await db.ref(`escrowTransactions/${escrowKey}`).update({
      status: newStatus,
      lastUpdate: admin.database.ServerValue.TIMESTAMP,
      payment: paymentEntity,
    });

    console.log(`Escrow ${escrowKey} updated to ${newStatus}`);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Internal error");
  }
});

// Capture payment (after consultation)
export const capturePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated",
    );
  }

  const { orderId } = data;

  try {
    const escrowRef = db
      .ref("escrowTransactions")
      .orderByChild("orderId")
      .equalTo(orderId);
    const snapshot = await escrowRef.once("value");
    if (!snapshot.exists()) {
      throw new functions.https.HttpsError("not-found", "Escrow not found");
    }

    const escrowKey = Object.keys(snapshot.val())[0];
    const escrowData = snapshot.val()[escrowKey];

    if (
      escrowData.buyerId !== context.auth.uid &&
      escrowData.sellerId !== context.auth.uid
    ) {
      throw new functions.https.HttpsError("permission-denied", "Unauthorized");
    }

    if (escrowData.status !== "authorized") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Payment not authorized",
      );
    }

    const capture = await getRazorpay().payments.capture(
      orderId,
      escrowData.amount * 100,
      "INR",
    );

    await db.ref(`escrowTransactions/${escrowKey}`).update({
      status: "captured",
      lastUpdate: admin.database.ServerValue.TIMESTAMP,
      milestones: [
        ...(escrowData.milestones || []),
        {
          description: "Funds Released",
          amount: escrowData.amount,
          status: "completed",
        },
      ],
    });

    return { success: true, capture };
  } catch (error) {
    console.error("Capture error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to capture payment",
    );
  }
});

// Get payment info for user
export const getPaymentInfo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated",
    );
  }

  const { orderId } = data;

  try {
    const queryRef = db.ref("escrowTransactions");
    let query: admin.database.Query;
    if (orderId) {
      query = queryRef.orderByChild("orderId").equalTo(orderId);
    } else {
      query = queryRef.orderByChild("buyerId").equalTo(context.auth!.uid);
    }

    const snapshot = await query.once("value");
    if (!snapshot.exists()) {
      return { payments: [] };
    }

    const payments: EscrowPayment[] = [];
    snapshot.forEach((childSnapshot) => {
      const payment = childSnapshot.val();
      // Only return payments for the authenticated user
      if (
        payment.buyerId === context.auth!.uid ||
        payment.sellerId === context.auth!.uid
      ) {
        payments.push({
          id: childSnapshot.key,
          ...payment,
        });
      }
    });

    return { payments };
  } catch (error) {
    console.error("Error getting payment info:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get payment info",
    );
  }
});

// Refund payment
export const refundPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated",
    );
  }

  const { paymentId, amount } = data;

  try {
    const refund = await getRazorpay().payments.refund(paymentId, {
      amount: amount * 100,
    });

    // Update escrow status
    const escrowRef = db
      .ref("escrowTransactions")
      .orderByChild("payment/id")
      .equalTo(paymentId);
    const snapshot = await escrowRef.once("value");
    if (snapshot.exists()) {
      const escrowKey = Object.keys(snapshot.val())[0];
      await db.ref(`escrowTransactions/${escrowKey}`).update({
        status: "refunded",
        lastUpdate: admin.database.ServerValue.TIMESTAMP,
        milestones: [
          ...(snapshot.val()[escrowKey].milestones || []),
          { description: "Refund Processed", amount, status: "completed" },
        ],
      });
    }

    return { success: true, refund };
  } catch (error) {
    console.error("Refund error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to process refund",
    );
  }
});

// Chatbot using Gemini API
export const chatbot = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated",
    );
  }

  const query = typeof data?.query === "string" ? data.query.trim() : "";
  const legalArea =
    typeof data?.legalArea === "string" ? data.legalArea.trim() : "";
  const history = Array.isArray(data?.history)
    ? data.history
        .filter(
          (
            turn: unknown,
          ): turn is { role: "user" | "model"; content: string } => {
            if (!turn || typeof turn !== "object") return false;
            const candidate = turn as {
              role?: unknown;
              content?: unknown;
            };
            return (
              (candidate.role === "user" || candidate.role === "model") &&
              typeof candidate.content === "string" &&
              candidate.content.trim().length > 0
            );
          },
        )
        .slice(-12)
        .map((turn: { role: "user" | "model"; content: string }) => ({
          role: turn.role,
          parts: [{ text: turn.content.slice(-4000) }],
        }))
    : [];

  if (!query || query.length > 4000) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A question of 4,000 characters or fewer is required.",
    );
  }

  try {
    const geminiApiKey = getRequiredSecret(
      process.env.GEMINI_API_KEY,
      "GEMINI_API_KEY",
    );

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const systemPrompt = `You are AskCounsel, a helpful AI legal assistant providing preliminary guidance based on Indian laws. Always emphasize that this is not a substitute for professional legal advice. Be accurate, concise, and helpful. If the query is outside your knowledge or requires specific legal counsel, recommend consulting a qualified lawyer from LegalSangam.`;
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history });
    const userPrompt = legalArea ? `[${legalArea}] ${query}` : query;
    const result = await chat.sendMessage(userPrompt);
    const response = result.response.text().trim();

    if (!response) {
      throw new Error("No response from Gemini");
    }

    return { response };
  } catch (error) {
    console.error("Chatbot error:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "Failed to process query");
  }
});
