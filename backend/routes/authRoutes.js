const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  setDefaultAddress
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public authentication routes
router.post("/register", register);
router.post("/login", login);

// Protected user profile routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Delivery address management
router.post("/address", protect, addAddress);
router.delete("/address/:addressId", protect, deleteAddress);
router.put("/address/:addressId/default", protect, setDefaultAddress);

module.exports = router;
