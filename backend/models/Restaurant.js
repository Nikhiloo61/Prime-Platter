const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    image: {
      type: String,
      required: [true, "Restaurant image URL is required"]
    },
    cuisine: {
      type: String,
      required: [true, "Cuisine type is required"],
      trim: true
    },
    location: {
      type: String,
      trim: true,
      default: "Connaught Place, New Delhi"
    },
    rating: {
      type: Number,
      default: 4.0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be greater than 5"]
    },
    deliveryTime: {
      type: String,
      default: "25-30 mins"
    },
    minOrder: {
      type: Number,
      default: 150,
      min: [0, "Minimum order cannot be negative"]
    },
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
