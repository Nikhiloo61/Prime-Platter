const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: [true, "menuItemId is required"]
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"]
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1
    },
    image: {
      type: String
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant"
    },
    customization: {
      size: String,
      addons: [String],
      instructions: String
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    guestId: {
      type: String,
      default: null,
      index: true
    },
    items: [cartItemSchema],
    couponCode: {
      type: String,
      default: ""
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "Total amount cannot be negative"]
    }
  },
  {
    timestamps: true
  }
);

// Method to recalculate subtotal, delivery fee, taxes, discount, and totalAmount
cartSchema.methods.calculateTotal = function () {
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  // Free delivery on orders above ₹299, otherwise standard ₹40
  this.deliveryFee = this.subtotal === 0 ? 0 : this.subtotal >= 299 ? 0 : 40;
  // 5% standard restaurant tax / GST
  this.tax = this.subtotal === 0 ? 0 : Math.round(this.subtotal * 0.05);

  const rawTotal = this.subtotal + this.deliveryFee + this.tax;
  this.totalAmount = Math.max(0, rawTotal - (this.discount || 0));
  return this.totalAmount;
};

module.exports = mongoose.model("Cart", cartSchema);
