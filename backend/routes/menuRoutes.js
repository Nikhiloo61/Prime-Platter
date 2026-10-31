const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require("../controllers/menuController");

router
  .route("/")
  .get(getMenuItems)
  .post(createMenuItem);

router
  .route("/:id")
  .get(getMenuItemById)
  .put(updateMenuItem)
  .delete(deleteMenuItem);

module.exports = router;
