const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().sort({ rating: -1 });
    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant by ID
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

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Public
const createRestaurant = async (req, res, next) => {
  try {
    const { name, description, image, cuisine, location, rating, deliveryTime, minOrder, isOpen } = req.body;

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
      rating,
      deliveryTime,
      minOrder,
      isOpen
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
// @access  Public
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
// @access  Public
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Also clean up linked menu items
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
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
