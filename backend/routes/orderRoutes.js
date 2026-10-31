
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
    adminOnly
} = require("../middleware/authMiddleware");

// Customer routes - login required
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);
router.post("/:id/reorder", protect, reorder);

// Admin routes - login and admin role required
router.get("/admin/all", protect, adminOnly, getAllOrdersAdmin);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatusAdmin);

module.exports = router;

