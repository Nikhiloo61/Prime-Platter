const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

// @desc    Get all menu items with dynamic filtering and search
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
  try {
    const { type, cuisine, minPrice, maxPrice, restaurantId, search } = req.query;
    const query = {};

    // 1. Filter by Diet Preference (Veg / Non-Veg)
    if (type) {
      if (Array.isArray(type)) {
        query.type = { $in: type };
      } else if (type === "Veg" || type === "Non-Veg") {
        query.type = type;
      }
    }

    // 2. Filter by Cuisine (Supports single or comma-separated list or array)
    if (cuisine) {
      if (Array.isArray(cuisine)) {
        query.cuisine = { $in: cuisine };
      } else if (typeof cuisine === "string") {
        const cuisines = cuisine.split(",").map(c => c.trim()).filter(Boolean);
        if (cuisines.length === 1) {
          query.cuisine = { $regex: new RegExp(`^${cuisines[0]}$`, "i") };
        } else if (cuisines.length > 1) {
          query.cuisine = { $in: cuisines.map(c => new RegExp(`^${c}$`, "i")) };
        }
      }
    }

    // 3. Filter by Price Range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== "") {
        const min = Number(minPrice);
        if (!isNaN(min)) query.price.$gte = min;
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        const max = Number(maxPrice);
        if (!isNaN(max)) query.price.$lte = max;
      }
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    // 4. Filter by Restaurant ID
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    // 5. Search against name, cuisine, and category
    if (search && search.trim() !== "") {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { name: searchRegex },
        { cuisine: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    const menuItems = await MenuItem.find(query)
      .populate("restaurantId", "name cuisine deliveryTime rating")
      .sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "restaurantId",
      "name cuisine deliveryTime rating location"
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Public
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, image, price, category, cuisine, type, restaurantId, rating, available } = req.body;

    // Validate required fields
    if (!name || price === undefined || !type || !restaurantId || !cuisine || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, image, price, cuisine, type ('Veg'/'Non-Veg'), and restaurantId"
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than or equal to 0"
      });
    }

    if (type !== "Veg" && type !== "Non-Veg") {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'Veg' or 'Non-Veg'"
      });
    }

    // Verify restaurant existence
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Referenced restaurant does not exist"
      });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      image,
      price: Number(price),
      category: category || "Main Course",
      cuisine,
      type,
      restaurantId,
      rating: rating !== undefined ? Number(rating) : 4.5,
      available: available !== undefined ? available : true
    });

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Public
const updateMenuItem = async (req, res, next) => {
  try {
    if (req.body.restaurantId) {
      const restaurant = await Restaurant.findById(req.body.restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Referenced restaurant does not exist"
        });
      }
    }

    if (req.body.price !== undefined && Number(req.body.price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than or equal to 0"
      });
    }

    if (req.body.type !== undefined && req.body.type !== "Veg" && req.body.type !== "Non-Veg") {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'Veg' or 'Non-Veg'"
      });
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("restaurantId", "name cuisine deliveryTime rating");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Public
const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
