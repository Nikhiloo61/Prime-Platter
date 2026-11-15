const express = require("express");
const router = express.Router();
const {
  getPaymentConfig,
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  processRefund
} = require("../controllers/paymentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/config", getPaymentConfig);
router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyPayment);
router.post("/webhook", handleWebhook);
router.post("/refund", protect, adminOnly, processRefund);

module.exports = router;
