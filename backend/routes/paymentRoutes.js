const express = require("express");
const router = express.Router();
const {
  getPaymentConfig,
  createRazorpayOrder,
  verifyPayment
} = require("../controllers/paymentController");

router.get("/config", getPaymentConfig);
router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyPayment);

module.exports = router;
