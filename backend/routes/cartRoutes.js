const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require("../controllers/cartController");
const { optionalAuth } = require("../middleware/authMiddleware");

// Apply optionalAuth to all cart routes so authenticated users have their cart tied to their account
router.use(optionalAuth);

router
  .route("/")
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router
  .route("/:menuItemId")
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
