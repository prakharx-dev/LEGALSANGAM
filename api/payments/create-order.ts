import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getPaymentStores,
  getRazorpay,
  handleCors,
  parseConsultationFee,
  requireUser,
  sendPaymentError,
  type BookingData,
} from "../../server/payment.js";

export default async function createOrder(
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
      sellerId?: unknown;
      booking?: Partial<BookingData>;
    };
    const sellerId = typeof body?.sellerId === "string" ? body.sellerId : "";
    const requestedBooking = body?.booking;
    if (
      !sellerId ||
      !requestedBooking ||
      typeof requestedBooking.date !== "string" ||
      !requestedBooking.date ||
      typeof requestedBooking.time !== "string" ||
      !requestedBooking.time ||
      requestedBooking.type !== "Video consultation" ||
      requestedBooking.duration !== "60 minutes" ||
      typeof requestedBooking.roomID !== "string" ||
      !/^[a-zA-Z0-9-]{8,80}$/.test(requestedBooking.roomID)
    ) {
      response
        .status(400)
        .json({ error: "A valid video consultation is required." });
      return;
    }

    const { firestore, realtimeDatabase } = getPaymentStores();
    const lawyerSnapshot = await firestore
      .collection("lawyers")
      .doc(sellerId)
      .get();
    if (!lawyerSnapshot.exists) {
      response.status(404).json({ error: "Advocate pricing is unavailable." });
      return;
    }

    const lawyer = lawyerSnapshot.data();
    if (lawyer?.available === false) {
      response
        .status(409)
        .json({ error: "This advocate is not available for booking." });
      return;
    }

    const consultationFee = parseConsultationFee(lawyer?.fees);
    const platformFee = Math.round(consultationFee * 0.08);
    const gst = Math.round((consultationFee + platformFee) * 0.18);
    const total = consultationFee + platformFee + gst;
    const amountPaise = total * 100;
    if (!Number.isSafeInteger(amountPaise)) {
      response.status(409).json({ error: "Advocate pricing is invalid." });
      return;
    }

    const bookingData: BookingData = {
      lawyer: {
        id: sellerId,
        name: typeof lawyer?.name === "string" ? lawyer.name : "Advocate",
        specialty:
          typeof lawyer?.specialty === "string"
            ? lawyer.specialty
            : "General Law",
        fees: String(lawyer?.fees),
      },
      date: requestedBooking.date,
      time: requestedBooking.time,
      duration: "60 minutes",
      type: "Video consultation",
      fee: consultationFee,
      platformFee,
      gst,
      total,
      roomID: requestedBooking.roomID,
    };

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `ls-${bookingData.roomID}`.slice(0, 40),
      notes: {
        clientId,
        sellerId,
        roomID: bookingData.roomID,
        date: bookingData.date,
        time: bookingData.time,
      },
    });

    await realtimeDatabase.ref("escrowTransactions").push({
      orderId: order.id,
      buyerId: clientId,
      sellerId,
      amount: total,
      amountPaise,
      currency: "INR",
      bookingData,
      status: "created",
      createdAt: Date.now(),
    });

    response.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    sendPaymentError(response, error);
  }
}
