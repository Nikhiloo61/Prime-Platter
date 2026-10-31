const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require("../controllers/cartController");

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
