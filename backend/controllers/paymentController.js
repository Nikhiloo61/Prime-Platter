const crypto = require("crypto");
const Order = require("../models/Order");

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
// @access  Public / Optional Auth
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
          "Razorpay test credentials are not configured in backend/.env. Please use Cash on Delivery (COD) or add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env."
      });
    }

    // Amount strictly calculated from server-side order total in Paise (1 INR = 100 paise)
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
      console.error("Razorpay API error:", rzpData);
      return res.status(500).json({
        success: false,
        message: rzpData.error?.description || "Failed to create Razorpay payment order"
      });
    }

    // Persist razorpay order ID on our order
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

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Public / Optional Auth
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

    if (expectedSignature !== razorpaySignature) {
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

    res.status(200).json({
      success: true,
      message: "Payment verified successfully!",
      order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentConfig,
  createRazorpayOrder,
  verifyPayment
};
