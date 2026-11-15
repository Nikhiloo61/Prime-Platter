const express = require("express");
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require("../controllers/restaurantController");
const { protect, restaurantOnly, adminOnly } = require("../middleware/authMiddleware");

// Public read routes
router.get("/", getAllRestaurants);
router.get("/owner/me", protect, restaurantOnly, getMyRestaurant);
router.get("/:id", getRestaurantById);

// Protected mutation routes
router.post("/", protect, restaurantOnly, createRestaurant);
router.put("/:id", protect, restaurantOnly, updateRestaurant);
router.delete("/:id", protect, adminOnly, deleteRestaurant);

module.exports = router;
