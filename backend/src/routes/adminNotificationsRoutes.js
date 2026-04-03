const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/checkRole");
const notificationsController = require("../controllers/notificationsController");

const adminRoles = ["admin", "manager", "staff"];

router.get(
  "/",
  authMiddleware,
  checkRole(adminRoles),
  notificationsController.listAdmin
);

router.post(
  "/",
  authMiddleware,
  checkRole(adminRoles),
  notificationsController.create
);

router.put(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  notificationsController.update
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  notificationsController.remove
);

module.exports = router;

