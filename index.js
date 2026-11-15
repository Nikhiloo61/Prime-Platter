const app = require("./backend/app");
const express = require("express");
const path = require("path");
const fs = require("fs");

// Optional static frontend serving when running full-stack monorepo from root
const modernDistPath = path.join(__dirname, "frontend", "dist");
const legacyPublicPath = path.join(__dirname, "public");

if (fs.existsSync(modernDistPath)) {
  app.use(express.static(modernDistPath));

  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/auth") ||
      req.path.startsWith("/restaurants") ||
      req.path.startsWith("/menu") ||
      req.path.startsWith("/cart") ||
      req.path.startsWith("/orders") ||
      req.path.startsWith("/payment") ||
      req.path.startsWith("/admin") ||
      req.path.startsWith("/health")
    ) {
      return next();
    }
    res.sendFile(path.join(modernDistPath, "index.html"));
  });
} else if (fs.existsSync(legacyPublicPath)) {
  app.use(express.static(legacyPublicPath));
}

module.exports = app;
