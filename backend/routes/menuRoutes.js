const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require("../controllers/menuController");
const { protect, restaurantOnly, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

// Protected routes
router.post("/", protect, restaurantOnly, createMenuItem);
router.put("/:id", protect, restaurantOnly, updateMenuItem);
router.delete("/:id", protect, restaurantOnly, deleteMenuItem);

module.exports = router;
