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
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    items: [cartItemSchema],
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

// Method to recalculate totalAmount
cartSchema.methods.calculateTotal = function () {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return this.totalAmount;
};

module.exports = mongoose.model("Cart", cartSchema);
