const http = require("http");
const path = require("path");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// Load local environment variables
dotenv.config({
  path: path.join(__dirname, ".env")
});

// Import Express application
const app = require("../index");

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Authenticate socket connections if token provided
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token && token.startsWith("Bearer ")) {
    try {
      const rawToken = token.split(" ")[1];
      const secret = process.env.JWT_SECRET || "prime_platter_jwt_secret_key_prod_default";
      const decoded = jwt.verify(rawToken, secret);
      socket.user = decoded;
    } catch (err) {
      // Allow connection as anonymous guest for tracking public orders
      socket.user = null;
    }
  }
  next();
});

// Socket Event Handlers
io.on("connection", (socket) => {
  // Join specific order room for real-time tracking updates
  socket.on("join:order", ({ orderId }) => {
    if (orderId) {
      socket.join(`order:${orderId}`);
    }
  });

  // Leave order room
  socket.on("leave:order", ({ orderId }) => {
    if (orderId) {
      socket.leave(`order:${orderId}`);
    }
  });

  // Live delivery GPS broadcast
  socket.on("driver:location_update", ({ orderId, latitude, longitude }) => {
    if (orderId && latitude && longitude) {
      io.to(`order:${orderId}`).emit("order:location_updated", {
        orderId,
        latitude,
        longitude,
        timestamp: new Date()
      });
    }
  });
});

// Expose Socket.IO instance to Express routes
app.set("io", io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Prime Platter server & Socket.IO active at http://localhost:${PORT}`);
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log("\nReceived shutdown signal. Closing server...");
  server.close(() => {
    console.log("Prime Platter server closed successfully.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
