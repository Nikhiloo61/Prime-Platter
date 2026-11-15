const mongoose = require("mongoose");

const addonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

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
      required: [true, "restaurantId reference is required"],
      index: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be greater than 5"]
    },
    available: {
      type: Boolean,
      default: true,
      index: true
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    addons: [addonSchema]
  },
  {
    timestamps: true
  }
);

menuItemSchema.index({ name: "text", cuisine: "text", category: "text", description: "text" });
menuItemSchema.index({ restaurantId: 1, available: 1 });
menuItemSchema.index({ price: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);
