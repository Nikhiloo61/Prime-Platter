const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");

// @desc    Natural Language AI Food Discovery Assistant
// @route   POST /api/ai/recommend
// @access  Public / Optional Auth
const getAiRecommendations = async (req, res, next) => {
  try {
    const { query = "" } = req.body;
    const cleanQuery = query.toLowerCase().trim();

    const dbQuery = { available: true };

    // 1. Dietary detection
    if (cleanQuery.includes("veg") && !cleanQuery.includes("non-veg")) {
      dbQuery.type = "Veg";
    } else if (cleanQuery.includes("non-veg") || cleanQuery.includes("chicken") || cleanQuery.includes("mutton")) {
      dbQuery.type = "Non-Veg";
    }

    // 2. Budget constraint detection (e.g. "under 300", "under ₹300", "below 250")
    const budgetMatch = cleanQuery.match(/(?:under|below|less than|within)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
    if (budgetMatch && budgetMatch[1]) {
      const maxBudget = parseInt(budgetMatch[1], 10);
      dbQuery.price = { $lte: maxBudget };
    }

    // 3. Cuisine / Category / Dish Keywords detection
    const keywords = ["biryani", "pizza", "burger", "chinese", "italian", "pasta", "dessert", "roll", "curry", "thali", "paneer", "noodle"];
    const detectedKeywords = keywords.filter((k) => cleanQuery.includes(k));

    if (detectedKeywords.length > 0) {
      const regexes = detectedKeywords.map((k) => new RegExp(k, "i"));
      dbQuery.$or = [
        { name: { $in: regexes } },
        { cuisine: { $in: regexes } },
        { category: { $in: regexes } },
        { description: { $in: regexes } }
      ];
    }

    // Query real MongoDB menu items
    let matchedItems = await MenuItem.find(dbQuery)
      .populate("restaurantId", "name cuisine deliveryTime rating")
      .sort({ rating: -1, price: 1 })
      .limit(6);

    // Fallback if no specific matches found
    if (matchedItems.length === 0) {
      matchedItems = await MenuItem.find({ available: true })
        .populate("restaurantId", "name cuisine deliveryTime rating")
        .sort({ rating: -1 })
        .limit(4);
    }

    // Craft friendly culinary assistant reply
    let reply = `Here are ${matchedItems.length} top-rated dish(es) matching your request:`;
    if (cleanQuery.includes("under") || cleanQuery.includes("budget")) {
      reply = `I found these budget-friendly culinary delights that taste incredible without breaking the bank:`;
    } else if (cleanQuery.includes("two people") || cleanQuery.includes("2 people")) {
      reply = `Here is a curated feast with generous portions perfect for two:`;
    } else if (cleanQuery.includes("veg")) {
      reply = `Fresh, vegetarian favorites crafted with aromatic spices and premium ingredients:`;
    } else if (cleanQuery.includes("pizza")) {
      reply = `Crispy crusts, handcrafted sauces, and gooey mozzarella — here are the finest pizza options:`;
    }

    res.status(200).json({
      success: true,
      query,
      reply,
      count: matchedItems.length,
      items: matchedItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Personalized Recommendations based on order history
// @route   GET /api/ai/personalized
// @access  Protected / Optional
const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    let preferredCuisines = ["Indian", "Italian"];

    if (req.user) {
      const userOrders = await Order.find({ userId: req.user._id }).limit(5);
      if (userOrders.length > 0) {
        const itemIds = userOrders.flatMap((o) => o.items.map((i) => i.menuItemId));
        const orderedItems = await MenuItem.find({ _id: { $in: itemIds } });
        const cuisines = orderedItems.map((i) => i.cuisine);
        if (cuisines.length > 0) {
          preferredCuisines = [...new Set(cuisines)];
        }
      }
    }

    const recommendations = await MenuItem.find({
      available: true,
      cuisine: { $in: preferredCuisines.map((c) => new RegExp(`^${c}$`, "i")) }
    })
      .populate("restaurantId", "name cuisine deliveryTime rating")
      .sort({ rating: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      basedOn: preferredCuisines,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAiRecommendations,
  getPersonalizedRecommendations
};
