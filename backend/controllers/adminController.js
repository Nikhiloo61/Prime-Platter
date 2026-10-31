const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");

// @desc    Get Admin Dashboard statistics
// @route   GET /api/admin/stats
// @access  Private / Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [totalOrders, totalRestaurants, totalMenuItems, totalUsers, orders] =
      await Promise.all([
        Order.countDocuments(),
        Restaurant.countDocuments(),
        MenuItem.countDocuments(),
        User.countDocuments({ role: "customer" }),
        Order.find().select("pricing.total orderStatus paymentInfo.status createdAt")
      ]);

    // Calculate revenue from Delivered or Paid orders
    const totalRevenue = orders
      .filter((o) => o.paymentInfo.status === "Paid" || o.orderStatus === "Delivered")
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    const pendingOrders = orders.filter(
      (o) => o.orderStatus === "Order Placed" || o.orderStatus === "Confirmed"
    ).length;

    const preparingOrders = orders.filter((o) => o.orderStatus === "Preparing").length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === "Cancelled").length;

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        preparingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRestaurants,
        totalMenuItems,
        totalUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle menu item availability
// @route   PUT /api/admin/menu/:id/toggle
// @access  Private / Admin
const toggleMenuItemAvailability = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    menuItem.available = !menuItem.available;
    await menuItem.save();

    res.status(200).json({
      success: true,
      message: `"${menuItem.name}" is now marked as ${menuItem.available ? "Available" : "Out of Stock"}`,
      menuItem
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  toggleMenuItemAvailability
};
