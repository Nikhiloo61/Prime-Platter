const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true
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
      min: [1, "Quantity must be at least 1"]
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

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true
      },
      email: {
        type: String,
        required: [true, "Customer email is required"],
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: [true, "Customer phone number is required"],
        trim: true
      }
    },
    deliveryAddress: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true
      }
    },
    items: {
      type: [orderItemSchema],
      validate: [
        (val) => val.length > 0,
        "Order must contain at least one item"
      ]
    },
    specialInstructions: {
      type: String,
      trim: true,
      default: ""
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0
      },
      deliveryFee: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      tax: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      total: {
        type: Number,
        required: true,
        min: 0
      }
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ["COD", "Online"],
        default: "COD"
      },
      status: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
      },
      transactionId: {
        type: String,
        default: ""
      },
      razorpayOrderId: {
        type: String,
        default: ""
      },
      razorpayPaymentId: {
        type: String,
        default: ""
      }
    },
    orderStatus: {
      type: String,
      enum: [
        "Order Placed",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
      ],
      default: "Order Placed"
    },
    statusHistory: [statusHistorySchema],
    estimatedDeliveryTime: {
      type: String,
      default: "30-40 mins"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);
