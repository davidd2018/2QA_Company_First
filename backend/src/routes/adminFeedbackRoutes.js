const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/checkRole");
const feedbackController = require("../controllers/feedbackController");

const adminRoles = ["admin", "manager", "staff"];

router.get("/", authMiddleware, checkRole(adminRoles), feedbackController.listAdmin);

router.put(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  feedbackController.update
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  feedbackController.remove
);

module.exports = router;

