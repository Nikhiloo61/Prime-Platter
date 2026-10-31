const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Cart = require("../models/Cart");
const { getActiveCartForRequest } = require("./cartController");

// Helper to generate unique order ID
const generateOrderId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PP-${dateStr}-${randomSuffix}`;
};

// @desc    Create a new food delivery order
// @route   POST /api/orders
// @access  Public / Optional Auth
const createOrder = async (req, res, next) => {
  try {
    const {
      customer,
      deliveryAddress,
      specialInstructions = "",
      paymentMethod = "COD"
    } = req.body;

    // Validate customer contact
    const custName = customer?.name || req.user?.name;
    const custEmail = customer?.email || req.user?.email;
    const custPhone = customer?.phone || req.user?.phone;

    if (!custName || !custEmail || !custPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer name, email, and phone number are required"
      });
    }

    // Validate delivery address
    if (
      !deliveryAddress ||
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address (street, city, state, pincode) is required"
      });
    }

    // Retrieve active cart
    const cart = await getActiveCartForRequest(req);

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add items before placing an order."
      });
    }

    // Verify items against live MongoDB MenuItems for price & availability
    const itemIds = cart.items.map((i) => i.menuItemId);
    const liveMenuItems = await MenuItem.find({ _id: { $in: itemIds } }).populate(
      "restaurantId"
    );
    const menuMap = new Map(liveMenuItems.map((m) => [m._id.toString(), m]));

    const verifiedOrderItems = [];
    let subtotal = 0;
    let estimatedTime = "30-40 mins";

    for (const item of cart.items) {
      const liveItem = menuMap.get(item.menuItemId.toString());

      if (!liveItem) {
        return res.status(400).json({
          success: false,
          message: `The item "${item.name}" is no longer available in our menu`
        });
      }

      if (!liveItem.available) {
        return res.status(400).json({
          success: false,
          message: `"${liveItem.name}" is currently out of stock`
        });
      }

      const itemTotal = liveItem.price * item.quantity;
      subtotal += itemTotal;

      if (liveItem.restaurantId && liveItem.restaurantId.deliveryTime) {
        estimatedTime = liveItem.restaurantId.deliveryTime;
      }

      verifiedOrderItems.push({
        menuItemId: liveItem._id,
        name: liveItem.name,
        price: liveItem.price,
        quantity: item.quantity,
        image: liveItem.image,
        restaurantId: liveItem.restaurantId?._id || liveItem.restaurantId
      });
    }

    // Server-side calculation of delivery charges and taxes
    const deliveryFee = subtotal >= 299 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + deliveryFee + tax;

    const orderId = generateOrderId();
    const isOnline = paymentMethod.toUpperCase() === "ONLINE";

    const order = await Order.create({
      orderId,
      userId: req.user ? req.user._id : null,
      customer: {
        name: custName.trim(),
        email: custEmail.trim().toLowerCase(),
        phone: custPhone.trim()
      },
      deliveryAddress: {
        street: deliveryAddress.street.trim(),
        city: deliveryAddress.city.trim(),
        state: deliveryAddress.state.trim(),
        pincode: deliveryAddress.pincode.trim()
      },
      items: verifiedOrderItems,
      specialInstructions: (specialInstructions || "").trim(),
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        total
      },
      paymentInfo: {
        method: isOnline ? "Online" : "COD",
        status: isOnline ? "Pending" : "Pending",
        transactionId: isOnline ? "" : `COD-${Date.now()}`
      },
      orderStatus: "Order Placed",
      statusHistory: [
        {
          status: "Order Placed",
          timestamp: new Date(),
          note: isOnline
            ? "Order placed, awaiting online payment confirmation"
            : "Order placed with Cash on Delivery"
        }
      ],
      estimatedDeliveryTime: estimatedTime
    });

    // Clear cart upon successful order creation
    cart.items = [];
    cart.subtotal = 0;
    cart.deliveryFee = 0;
    cart.tax = 0;
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID or orderId
// @route   GET /api/orders/:id
// @access  Public / Protected
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by custom orderId (e.g. PP-20261031-ABCD) or MongoDB ObjectId
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { $or: [{ _id: id }, { orderId: id }] } : { orderId: id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

// Only the order owner or an admin can view the order
    const isOwner =
        order.userId &&
        order.userId.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to view this order"
        });
}

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for the authenticated user
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Public / Private
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = "Customer requested cancellation" } = req.body;

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { $or: [{ _id: id }, { orderId: id }] } : { orderId: id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

  // Only the order owner or an admin can cancel the order
    const isOwner =
        order.userId &&
        order.userId.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to cancel this order"
        });
    }

    // Check cancellation eligibility
    const cancellableStatuses = ["Order Placed", "Confirmed"];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already "${order.orderStatus}"`
      });
    }

    order.orderStatus = "Cancelled";
    order.statusHistory.push({
      status: "Cancelled",
      timestamp: new Date(),
      note: reason
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder items from a previous order into the active cart
// @route   POST /api/orders/:id/reorder
// @access  Public / Optional Auth
const reorder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { $or: [{ _id: id }, { orderId: id }] } : { orderId: id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const cart = await getActiveCartForRequest(req);

    // Add valid order items into cart
    let addedCount = 0;
    for (const item of order.items) {
      const liveItem = await MenuItem.findById(item.menuItemId);
      if (liveItem && liveItem.available) {
        const existingIndex = cart.items.findIndex(
          (ci) => ci.menuItemId.toString() === liveItem._id.toString()
        );
        if (existingIndex > -1) {
          cart.items[existingIndex].quantity += item.quantity;
        } else {
          cart.items.push({
            menuItemId: liveItem._id,
            name: liveItem.name,
            price: liveItem.price,
            quantity: item.quantity,
            image: liveItem.image,
            restaurantId: liveItem.restaurantId
          });
        }
        addedCount++;
      }
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      message: `${addedCount} item(s) added to your cart`,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private / Admin
const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.orderStatus = status;
    }

    if (search && search.trim() !== "") {
      const s = search.trim();
      filter.$or = [
        { orderId: { $regex: s, $options: "i" } },
        { "customer.name": { $regex: s, $options: "i" } },
        { "customer.phone": { $regex: s, $options: "i" } },
        { "customer.email": { $regex: s, $options: "i" } }
      ];
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/admin/:id/status
// @access  Private / Admin
const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note = "", paymentStatus } = req.body;

    const validStatuses = [
      "Order Placed",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { $or: [{ _id: id }, { orderId: id }] } : { orderId: id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order marked as ${status} by admin`
    });

    if (paymentStatus) {
      order.paymentInfo.status = paymentStatus;
    } else if (status === "Delivered" && order.paymentInfo.method === "COD") {
      // If COD order is delivered, automatically mark as Paid
      order.paymentInfo.status = "Paid";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,
  reorder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin
};
