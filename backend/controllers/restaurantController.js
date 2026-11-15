const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

// @desc    Get all restaurants with search & pagination
// @route   GET /api/restaurants
// @access  Public
const getAllRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, page = 1, limit = 20 } = req.query;
    const query = {};

    if (cuisine) {
      query.cuisine = { $regex: cuisine, $options: "i" };
    }

    if (search && search.trim() !== "") {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { cuisine: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }
    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant owned by current authenticated user
// @route   GET /api/restaurants/owner/me
// @access  Private / Restaurant Owner
const getMyRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
      // Fallback: if not explicitly linked by ownerId yet, link first restaurant or return 404
      restaurant = await Restaurant.findOne();
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant found associated with this account"
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private / Admin / Restaurant Owner
const createRestaurant = async (req, res, next) => {
  try {
    const { name, description, image, cuisine, location, rating, deliveryTime, minOrder, isOpen, openingHours } = req.body;

    if (!name || !image || !cuisine) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, image, and cuisine for the restaurant"
      });
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      image,
      cuisine,
      location,
      rating: rating !== undefined ? Number(rating) : 4.0,
      deliveryTime,
      minOrder: minOrder !== undefined ? Number(minOrder) : 150,
      isOpen: isOpen !== undefined ? isOpen : true,
      openingHours: openingHours || "10:00 AM - 11:00 PM",
      ownerId: req.user?._id || null
    });

    res.status(201).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private / Admin / Restaurant Owner
const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private / Admin
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Clean up associated menu items
    await MenuItem.deleteMany({ restaurantId: req.params.id });

    res.status(200).json({
      success: true,
      message: "Restaurant and associated menu items deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
