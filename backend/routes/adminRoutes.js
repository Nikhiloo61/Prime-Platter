const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  toggleMenuItemAvailability
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin routes are guarded by protect and adminOnly
router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.put("/menu/:id/toggle", toggleMenuItemAvailability);

module.exports = router;
