const express = require("express");
const router = express.Router();
const {
  getAiRecommendations,
  getPersonalizedRecommendations
} = require("../controllers/aiController");
const { optionalAuth } = require("../middleware/authMiddleware");

router.post("/recommend", optionalAuth, getAiRecommendations);
router.get("/personalized", optionalAuth, getPersonalizedRecommendations);

module.exports = router;
