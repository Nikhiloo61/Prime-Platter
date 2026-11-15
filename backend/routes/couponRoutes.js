const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// @desc    Get active coupons
// @route   GET /api/coupons
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
router.post("/validate", async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const cleanCode = code.toUpperCase().trim();
    let coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    // Built-in standard coupons fallback if not yet in database
    if (!coupon) {
      if (cleanCode === "WELCOME50" || cleanCode === "PRIME50") {
        coupon = {
          code: cleanCode,
          discountType: "percentage",
          discountValue: 50,
          maxDiscount: 100,
          minOrderAmount: 199
        };
      } else if (cleanCode === "TASTY20" || cleanCode === "SWIGGYIT") {
        coupon = {
          code: cleanCode,
          discountType: "percentage",
          discountValue: 20,
          maxDiscount: 75,
          minOrderAmount: 199
        };
      } else if (cleanCode === "FREEDEL") {
        coupon = {
          code: cleanCode,
          discountType: "flat",
          discountValue: 40,
          maxDiscount: 40,
          minOrderAmount: 0
        };
      }
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
    }

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for ${coupon.code}`
      });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = Math.min(Math.round((subtotal * coupon.discountValue) / 100), coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    res.status(200).json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discount,
        description: `${coupon.discountValue}% off up to ₹${coupon.maxDiscount}`
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new coupon (Admin only)
// @route   POST /api/coupons
// @access  Private / Admin
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { code, discountType, discountValue, maxDiscount, minOrderAmount } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({
        success: false,
        message: "Code and discountValue are required"
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      maxDiscount: maxDiscount !== undefined ? Number(maxDiscount) : 100,
      minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : 199
    });

    res.status(201).json({
      success: true,
      coupon
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
