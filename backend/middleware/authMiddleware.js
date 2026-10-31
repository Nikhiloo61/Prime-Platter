const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment variables");
}

/**
 * Protect routes: Requires valid JWT token in Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found or session has expired"
        });
      }

      return next();
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token verification failed"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no authentication token provided"
    });
  }
};

/**
 * Restrict route to admin users only
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied: Administrator privileges required"
  });
};

/**
 * Optional authentication: Attaches req.user if token is present and valid,
 * otherwise proceeds with req.user = null without blocking the request.
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  optionalAuth
};
