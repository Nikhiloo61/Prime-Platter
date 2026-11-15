const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

// @desc    Submit a review for an order
// @route   POST /api/reviews
// @access  Protected
router.post("/", protect, async (req, res, next) => {
  try {
    const { orderId, rating, comment, restaurantId } = req.body;

    if (!orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "orderId, rating, and comment are required"
      });
    }

    // Verify order exists
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const review = await Review.create({
      userId: req.user._id,
      orderId,
      restaurantId: restaurantId || order.restaurantId || null,
      rating: Number(rating),
      comment: comment.trim()
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get reviews
// @route   GET /api/reviews
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const mongoose = require("mongoose");
    const filter = {};
    if (restaurantId && mongoose.Types.ObjectId.isValid(restaurantId)) {
      filter.restaurantId = restaurantId;
    }
    const reviews = await Review.find(filter)
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
