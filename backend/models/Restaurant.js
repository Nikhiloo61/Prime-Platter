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
    coordinates: {
      latitude: { type: Number, default: 28.6315 },
      longitude: { type: Number, default: 77.2167 }
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
    },
    openingHours: {
      type: String,
      default: "10:00 AM - 11:00 PM"
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

restaurantSchema.index({ name: "text", cuisine: "text", location: "text" });
restaurantSchema.index({ rating: -1 });

module.exports = mongoose.model("Restaurant", restaurantSchema);
