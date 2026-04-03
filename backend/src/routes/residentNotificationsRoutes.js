const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/checkRole");
const notificationsController = require("../controllers/notificationsController");

router.get(
  "/",
  authMiddleware,
  checkRole(["resident"]),
  notificationsController.listAll
);

module.exports = router;

