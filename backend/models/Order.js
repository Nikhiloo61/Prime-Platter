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
    },
    customization: {
      size: String,
      addons: [String],
      instructions: String
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
      default: null,
      index: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
      index: true
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      }
    },
    deliveryAddress: {
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      pincode: {
        type: String,
        required: true,
        trim: true
      },
      coordinates: {
        latitude: { type: Number, default: 28.6139 },
        longitude: { type: Number, default: 77.2090 }
      }
    },
    items: [orderItemSchema],
    specialInstructions: {
      type: String,
      default: "",
      trim: true
    },
    couponCode: {
      type: String,
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
      discount: {
        type: Number,
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
        enum: ["Pending", "Paid", "Failed", "Refunded"],
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
      default: "Order Placed",
      index: true
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

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
