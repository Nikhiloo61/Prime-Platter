const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./backend/config/db");

const restaurantRoutes = require("./backend/routes/restaurantRoutes");
const menuRoutes = require("./backend/routes/menuRoutes");
const cartRoutes = require("./backend/routes/cartRoutes");

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
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);

// Local development frontend
if (!process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, "public")));

    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return next();
        }

        res.sendFile(
            path.join(__dirname, "public", "index.html")
        );
    });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export application for Vercel
module.exports = app;