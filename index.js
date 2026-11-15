const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Ensure environment variables are loaded regardless of entry point
dotenv.config({
  path: path.join(__dirname, "backend/.env")
});

const connectDB = require("./backend/config/db");

// Import all API routes
const restaurantRoutes = require("./backend/routes/restaurantRoutes");
const menuRoutes = require("./backend/routes/menuRoutes");
const cartRoutes = require("./backend/routes/cartRoutes");
const authRoutes = require("./backend/routes/authRoutes");
const orderRoutes = require("./backend/routes/orderRoutes");
const paymentRoutes = require("./backend/routes/paymentRoutes");
const adminRoutes = require("./backend/routes/adminRoutes");
const aiRoutes = require("./backend/routes/aiRoutes");
const reviewRoutes = require("./backend/routes/reviewRoutes");
const couponRoutes = require("./backend/routes/couponRoutes");

const {
  notFound,
  errorHandler
} = require("./backend/middleware/errorMiddleware");

const app = express();

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
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
      // Allow requests with no origin (like mobile apps, curl, postman) or matching origins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local development & review
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  })
);

// Standard Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting on API endpoints (protection against brute force / DoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  }
});
app.use("/api", apiLimiter);

// Specific stricter limiter for authentication attempts
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Prime Platter REST API is running successfully",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection middleware for API routes
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Mount all API routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);

// Static frontend serving:
// Priority 1: Modern Vite React Production Build (`frontend/dist`)
// Priority 2: Legacy Static HTML/CSS (`public`)
const modernDistPath = path.join(__dirname, "frontend", "dist");
const legacyPublicPath = path.join(__dirname, "public");

if (fs.existsSync(modernDistPath)) {
  app.use(express.static(modernDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(modernDistPath, "index.html"));
  });
} else {
  app.use(express.static(legacyPublicPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    const cleanPath = req.path.replace(/^\//, "");
    if (cleanPath) {
      const potentialHtml = path.join(legacyPublicPath, `${cleanPath}.html`);
      if (fs.existsSync(potentialHtml)) {
        return res.sendFile(potentialHtml);
      }
    }

    res.sendFile(path.join(legacyPublicPath, "index.html"));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
