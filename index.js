const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./backend/config/db");

const restaurantRoutes = require("./backend/routes/restaurantRoutes");
const menuRoutes = require("./backend/routes/menuRoutes");
const cartRoutes = require("./backend/routes/cartRoutes");
const authRoutes = require("./backend/routes/authRoutes");
const orderRoutes = require("./backend/routes/orderRoutes");
const paymentRoutes = require("./backend/routes/paymentRoutes");
const adminRoutes = require("./backend/routes/adminRoutes");

const {
    notFound,
    errorHandler
} = require("./backend/middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Prime Platter REST API is running successfully"
    });
});

// MongoDB connection for API requests
app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Serve static frontend files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Route handler for HTML pages (supports both clean URLs and fallback to index.html)
app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
        return next();
    }

    // Check if clean URL matches an HTML file in public
    const cleanPath = req.path.replace(/^\//, "");
    if (cleanPath) {
        const potentialHtml = path.join(__dirname, "public", `${cleanPath}.html`);
        if (fs.existsSync(potentialHtml)) {
            return res.sendFile(potentialHtml);
        }
    }

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export application for Vercel
module.exports = app;
