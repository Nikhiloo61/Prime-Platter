const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    image: {
      type: String,
      required: [true, "Menu item image URL is required"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than or equal to 0"]
    },
    category: {
      type: String,
      trim: true,
      default: "Main Course"
    },
    cuisine: {
      type: String,
      required: [true, "Cuisine is required"],
      trim: true
    },
    type: {
      type: String,
      required: [true, "Item type is required (Veg or Non-Veg)"],
      enum: {
        values: ["Veg", "Non-Veg"],
        message: "Type must be either 'Veg' or 'Non-Veg'"
      }
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "restaurantId reference is required"]
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be greater than 5"]
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
