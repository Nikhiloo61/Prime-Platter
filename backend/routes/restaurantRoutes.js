const express = require("express");
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require("../controllers/restaurantController");

router
  .route("/")
  .get(getAllRestaurants)
  .post(createRestaurant);

router
  .route("/:id")
  .get(getRestaurantById)
  .put(updateRestaurant)
  .delete(deleteRestaurant);

module.exports = router;
