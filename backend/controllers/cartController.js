const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");

// Helper to resolve or create the active cart based on user or session
const getActiveCartForRequest = async (req) => {
  let query = null;
  const guestId = req.headers["x-cart-id"] || req.query.guestId;

  if (req.user && req.user._id) {
    query = { userId: req.user._id };
  } else if (guestId) {
    query = { guestId };
  } else {
    // Fallback for anonymous legacy/test requests
    query = { userId: null, guestId: null };
  }

  let cart = await Cart.findOne(query);

  // If authenticated user doesn't have a user-cart yet, but has a guest cart, migrate it
  if (!cart && req.user && req.user._id && guestId) {
    cart = await Cart.findOne({ guestId });
    if (cart) {
      cart.userId = req.user._id;
      cart.guestId = null;
      await cart.save();
    }
  }

  // If still not found, create a new cart
  if (!cart) {
    cart = await Cart.create({
      userId: req.user ? req.user._id : null,
      guestId: req.user ? null : guestId || null,
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      totalAmount: 0
    });
  }

  return cart;
};

// @desc    Get current cart
// @route   GET /api/cart
// @access  Public (supports optional token / session header)
const getCart = async (req, res, next) => {
  try {
    const cart = await getActiveCartForRequest(req);

    // Sync cart with database MenuItem data (prices, active availability)
    if (cart.items.length > 0) {
      const itemIds = cart.items.map((i) => i.menuItemId);
      const liveMenuItems = await MenuItem.find({ _id: { $in: itemIds } });
      const menuMap = new Map(liveMenuItems.map((m) => [m._id.toString(), m]));

      // Filter out deleted or unavailable items
      const validItems = [];
      for (const item of cart.items) {
        const liveItem = menuMap.get(item.menuItemId.toString());
        if (liveItem && liveItem.available) {
          item.price = liveItem.price;
          item.name = liveItem.name;
          item.image = liveItem.image;
          validItems.push(item);
        }
      }
      cart.items = validItems;
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      items: cart.items,
      subtotal: cart.subtotal || 0,
      deliveryFee: cart.deliveryFee || 0,
      tax: cart.tax || 0,
      totalAmount: cart.totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Public (supports optional token / session header)
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

    if (!menuItem.available) {
      return res.status(400).json({
        success: false,
        message: `${menuItem.name} is currently out of stock`
      });
    }

    const cart = await getActiveCartForRequest(req);

    const existingIndex = cart.items.findIndex(
      (item) => item.menuItemId.toString() === menuItemId.toString()
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += qty;
    } else {
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
      subtotal: cart.subtotal || 0,
      deliveryFee: cart.deliveryFee || 0,
      tax: cart.tax || 0,
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
    const cart = await getActiveCartForRequest(req);

    const itemIndex = cart.items.findIndex(
      (item) => item.menuItemId.toString() === menuItemId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = qty;
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      items: cart.items,
      subtotal: cart.subtotal || 0,
      deliveryFee: cart.deliveryFee || 0,
      tax: cart.tax || 0,
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
    const cart = await getActiveCartForRequest(req);

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.menuItemId.toString() !== menuItemId.toString()
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
      subtotal: cart.subtotal || 0,
      deliveryFee: cart.deliveryFee || 0,
      tax: cart.tax || 0,
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
    const cart = await getActiveCartForRequest(req);
    cart.items = [];
    cart.subtotal = 0;
    cart.deliveryFee = 0;
    cart.tax = 0;
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      totalAmount: 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveCartForRequest,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
