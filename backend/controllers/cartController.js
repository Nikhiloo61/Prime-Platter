const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");

// Helper to get or create the single active cart
const getActiveCart = async () => {
  let cart = await Cart.findOne();
  if (!cart) {
    cart = await Cart.create({ items: [], totalAmount: 0 });
  }
  return cart;
};

// @desc    Get current cart
// @route   GET /api/cart
// @access  Public
const getCart = async (req, res, next) => {
  try {
    const cart = await getActiveCart();
    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      items: cart.items,
      totalAmount: cart.totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Public
const addToCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    if (!menuItemId) {
      return res.status(400).json({
        success: false,
        message: "menuItemId is required"
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer"
      });
    }

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    const cart = await getActiveCart();

    const existingIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId.toString()
    );

    if (existingIndex > -1) {
      // Increase quantity if item already exists
      cart.items[existingIndex].quantity += qty;
    } else {
      // Add new item with details from MenuItem
      cart.items.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        image: menuItem.image,
        restaurantId: menuItem.restaurantId
      });
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      message: `${menuItem.name} added to cart`,
      items: cart.items,
      totalAmount: cart.totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:menuItemId
// @access  Public
const updateCartItem = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required"
      });
    }

    const qty = parseInt(quantity, 10);
    const cart = await getActiveCart();

    const itemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    if (qty <= 0) {
      // If quantity is 0 or negative, remove from cart
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = qty;
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      items: cart.items,
      totalAmount: cart.totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/:menuItemId
// @access  Public
const removeFromCart = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const cart = await getActiveCart();

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.menuItemId.toString() !== menuItemId.toString()
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      items: cart.items,
      totalAmount: cart.totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Public
const clearCart = async (req, res, next) => {
  try {
    const cart = await getActiveCart();
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      items: [],
      totalAmount: 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
