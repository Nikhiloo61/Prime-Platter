const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,
  reorder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getRestaurantOrders,
  getDeliveryOrders
} = require("../controllers/orderController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

// Customer routes - login required
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);
router.post("/:id/reorder", protect, reorder);

// Restaurant & Delivery Partner routes
router.get("/restaurant/:restaurantId", protect, getRestaurantOrders);
router.get("/delivery/assigned", protect, getDeliveryOrders);

// Admin / Staff routes
router.get("/admin/all", protect, adminOnly, getAllOrdersAdmin);
router.put("/admin/:id/status", protect, updateOrderStatusAdmin);

module.exports = router;
