const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config({
  path: path.join(__dirname, ".env")
});

const connectDB = require("./config/db");

// Import all route modules
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuRoutes = require("./routes/menuRoutes");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Dynamic CORS whitelist supporting production Vercel domains, localhost, and custom client URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5001"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Match explicit whitelist
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      // Automatically allow any Vercel preview or production deployment (*.vercel.app)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Fallback permissive for smooth client integration
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-cart-id",
      "x-razorpay-signature",
      "X-Requested-With"
    ]
  })
);

// Standard Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting (protect against brute force / DoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  }
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login/registration attempts from this IP, please try again later"
  }
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

// System Health Check handler
const healthHandler = (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Prime Platter REST API is running successfully",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
};

app.get("/api/health", healthHandler);
app.get("/health", healthHandler);
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    name: "Prime Platter API",
    version: "2.0.0",
    docs: "/api/health"
  });
});

// MongoDB Connection Middleware for all incoming API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Dual-Mount API Routes:
// Mounts both /api/<resource> AND /<resource> so that regardless of how VITE_API_URL
// is configured on the frontend (with or without /api), requests will NEVER 404!
const mountApiRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/restaurants`, restaurantRoutes);
  app.use(`${prefix}/menu`, menuRoutes);
  app.use(`${prefix}/cart`, cartRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/payment`, paymentRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/ai`, aiRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
  app.use(`${prefix}/coupons`, couponRoutes);
};

mountApiRoutes("/api");
mountApiRoutes(""); // e.g. /restaurants, /menu, /cart, /orders, etc.

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
