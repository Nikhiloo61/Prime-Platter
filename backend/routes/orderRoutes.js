const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,
  reorder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin
} = require("../controllers/orderController");
const {
  protect,
  adminOnly,
  optionalAuth
} = require("../middleware/authMiddleware");

// Public / Authenticated Customer Routes
router.post("/", optionalAuth, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", optionalAuth, getOrderById);
router.put("/:id/cancel", optionalAuth, cancelOrder);
router.post("/:id/reorder", optionalAuth, reorder);

// Admin Routes
router.get("/admin/all", protect, adminOnly, getAllOrdersAdmin);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatusAdmin);

module.exports = router;
