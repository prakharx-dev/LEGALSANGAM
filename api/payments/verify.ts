import { createHmac, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getPaymentStores,
  getRazorpay,
  handleCors,
  requireUser,
  sendPaymentError,
  type BookingData,
} from "../../server/payment";

export default async function verifyPayment(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (handleCors(request, response)) return;
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const clientId = await requireUser(request);
    const body = request.body as {
      razorpay_order_id?: unknown;
      razorpay_payment_id?: unknown;
      razorpay_signature?: unknown;
    };
    const orderId = body?.razorpay_order_id;
    const paymentId = body?.razorpay_payment_id;
    const signature = body?.razorpay_signature;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (
      typeof orderId !== "string" ||
      typeof paymentId !== "string" ||
      typeof signature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(signature) ||
      !keySecret
    ) {
      response.status(400).json({ error: "Payment details are invalid." });
      return;
    }

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest();
    const providedSignature = Buffer.from(signature, "hex");
    if (
      providedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(providedSignature, expectedSignature)
    ) {
      response.status(400).json({ error: "Payment verification failed." });
      return;
    }

    const { firestore, realtimeDatabase, serverTimestamp } = getPaymentStores();
    const matchingOrders = await realtimeDatabase
      .ref("escrowTransactions")
      .orderByChild("orderId")
      .equalTo(orderId)
      .once("value");
    if (!matchingOrders.exists()) {
      response.status(404).json({ error: "Payment order was not found." });
      return;
    }

    const entries = Object.entries(matchingOrders.val()) as [
      string,
      {
        buyerId: string;
        amountPaise: number;
        currency: string;
        bookingData: BookingData;
      },
    ][];
    const [transactionKey, paymentOrder] = entries[0];
    if (paymentOrder.buyerId !== clientId) {
      response
        .status(403)
        .json({ error: "This payment order belongs to another user." });
      return;
    }

    const razorpay = getRazorpay();
    let payment = (await razorpay.payments.fetch(paymentId)) as {
      order_id: string;
      amount: number;
      currency: string;
      status: string;
    };
    if (payment.status === "authorized") {
      payment = (await razorpay.payments.capture(
        paymentId,
        paymentOrder.amountPaise,
        paymentOrder.currency,
      )) as typeof payment;
    }
    if (
      payment.order_id !== orderId ||
      payment.amount !== paymentOrder.amountPaise ||
      payment.currency !== paymentOrder.currency ||
      payment.status !== "captured"
    ) {
      response
        .status(409)
        .json({ error: "Payment has not been captured for this order." });
      return;
    }

    const bookingRef = firestore.collection("bookings").doc(orderId);
    await firestore.runTransaction(async (transaction) => {
      const existingBooking = await transaction.get(bookingRef);
      if (existingBooking.exists) {
        const existingData = existingBooking.data();
        if (
          existingData?.clientId === clientId &&
          existingData?.paymentId === paymentId
        ) {
          return;
        }
        throw new Error(
          "This payment order is already linked to another booking.",
        );
      }

      transaction.create(bookingRef, {
        clientId,
        lawyerId: paymentOrder.bookingData.lawyer.id,
        lawyerName: paymentOrder.bookingData.lawyer.name,
        specialty: paymentOrder.bookingData.lawyer.specialty,
        ...paymentOrder.bookingData,
        paymentProvider: "razorpay",
        paymentOrderId: orderId,
        paymentId,
        status: "confirmed",
        createdAt: serverTimestamp(),
      });
    });

    await realtimeDatabase.ref(`escrowTransactions/${transactionKey}`).update({
      status: "captured",
      payment: {
        id: paymentId,
        orderId,
        amount: payment.amount,
        currency: payment.currency,
      },
      lastUpdate: Date.now(),
    });

    response.status(200).json({
      success: true,
      bookingId: orderId,
      bookingData: paymentOrder.bookingData,
    });
  } catch (error) {
    sendPaymentError(response, error);
  }
}
