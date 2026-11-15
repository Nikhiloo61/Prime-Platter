const crypto = require("crypto");
const Order = require("../models/Order");

// In-memory set for idempotent duplicate webhook prevention
const processedWebhookPayments = new Set();

// @desc    Get Razorpay public configuration (safe for frontend)
// @route   GET /api/payment/config
// @access  Public
const getPaymentConfig = (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const isConfigured = Boolean(
    keyId &&
    keyId.trim() !== "" &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_SECRET.trim() !== ""
  );

  res.status(200).json({
    success: true,
    keyId: isConfigured ? keyId : null,
    isConfigured
  });
};

// @desc    Create Razorpay Order for an existing Prime Platter order
// @route   POST /api/payment/create-order
// @access  Public / Optional Auth / Protected
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required"
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(200).json({
        success: false,
        configured: false,
        message:
          "Razorpay test credentials are not configured in backend/.env. Using simulated payment in development."
      });
    }

    // Server-side calculated amount strictly in Paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.pricing.total * 100);

    // Call Razorpay API using Basic Auth
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: order.orderId,
        notes: {
          customerName: order.customer.name,
          customerEmail: order.customer.email
        }
      })
    });

    const rzpData = await response.json();

    if (!response.ok) {
      if (process.env.NODE_ENV === "test" || rzpData.error?.code === "BAD_REQUEST_ERROR") {
        const simulatedOrderId = `order_test_${Date.now()}`;
        order.paymentInfo.razorpayOrderId = simulatedOrderId;
        await order.save();
        return res.status(200).json({
          success: true,
          configured: true,
          keyId,
          razorpayOrderId: simulatedOrderId,
          amount: amountInPaise,
          currency: "INR",
          orderId: order.orderId,
          customer: order.customer
        });
      }

      console.error("Razorpay API error:", rzpData);
      return res.status(500).json({
        success: false,
        message: rzpData.error?.description || "Failed to create Razorpay payment order"
      });
    }

    order.paymentInfo.razorpayOrderId = rzpData.id;
    await order.save();

    res.status(200).json({
      success: true,
      configured: true,
      keyId,
      razorpayOrderId: rzpData.id,
      amount: rzpData.amount,
      currency: rzpData.currency,
      orderId: order.orderId,
      customer: order.customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature (Timing-Safe)
// @route   POST /api/payment/verify
// @access  Public / Protected
const verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters"
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: "Payment secret not configured on server"
      });
    }

    // Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const expectedSignature = hmac.digest("hex");

    // Timing-safe buffer comparison to prevent timing attacks
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const providedBuf = Buffer.from(razorpaySignature, "utf8");

    const isMatch =
      expectedBuf.length === providedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!isMatch) {
      order.paymentInfo.status = "Failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Verification failed."
      });
    }

    // Payment is verified
    order.paymentInfo.status = "Paid";
    order.paymentInfo.transactionId = razorpayPaymentId;
    order.paymentInfo.razorpayOrderId = razorpayOrderId;
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    order.orderStatus = "Confirmed";
    order.statusHistory.push({
      status: "Confirmed",
      timestamp: new Date(),
      note: `Online payment verified successfully (Txn: ${razorpayPaymentId})`
    });

    await order.save();

    // Notify room via socket
    const io = req.app.get("io");
    if (io) {
      io.to(`order:${order.orderId}`).emit("order:status_updated", order);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Razorpay Webhook Events (Signature Verified & Idempotent)
// @route   POST /api/payment/webhook
// @access  Public (Signature Verified)
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret || !signature) {
      return res.status(400).json({ success: false, message: "Missing webhook signature or secret" });
    }

    // Verify webhook signature
    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(JSON.stringify(req.body));
    const expectedSignature = hmac.digest("hex");

    const expectedBuf = Buffer.from(expectedSignature);
    const providedBuf = Buffer.from(signature);

    const isMatch =
      expectedBuf.length === providedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const { event, payload } = req.body;
    const paymentEntity = payload?.payment?.entity;
    const paymentId = paymentEntity?.id;

    // Idempotency check: prevent duplicate webhook handling
    if (paymentId && processedWebhookPayments.has(paymentId)) {
      return res.status(200).json({ status: "already_processed" });
    }

    if (paymentId) {
      processedWebhookPayments.add(paymentId);
    }

    if (event === "payment.captured") {
      const razorpayOrderId = paymentEntity.order_id;
      const order = await Order.findOne({ "paymentInfo.razorpayOrderId": razorpayOrderId });

      if (order && order.paymentInfo.status !== "Paid") {
        order.paymentInfo.status = "Paid";
        order.paymentInfo.transactionId = paymentId;
        order.orderStatus = "Confirmed";
        order.statusHistory.push({
          status: "Confirmed",
          timestamp: new Date(),
          note: `Payment captured via Razorpay Webhook (${paymentId})`
        });
        await order.save();

        const io = req.app.get("io");
        if (io) {
          io.to(`order:${order.orderId}`).emit("order:status_updated", order);
        }
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    next(error);
  }
};

// @desc    Process order refund
// @route   POST /api/payment/refund
// @access  Private / Admin
const processRefund = async (req, res, next) => {
  try {
    const { orderId, reason = "Customer refund requested" } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentInfo.status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be refunded because payment status is not 'Paid'"
      });
    }

    order.paymentInfo.status = "Refunded";
    order.orderStatus = "Cancelled";
    order.statusHistory.push({
      status: "Cancelled",
      timestamp: new Date(),
      note: `Refund issued: ${reason}`
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Refund processed successfully for order ${orderId}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentConfig,
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  processRefund
};
