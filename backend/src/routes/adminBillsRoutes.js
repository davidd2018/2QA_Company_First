const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/checkRole");
const billsController = require("../controllers/billsController");

const adminRoles = ["admin", "manager", "staff"];

router.get("/", authMiddleware, checkRole(adminRoles), billsController.listAdmin);

router.post("/", authMiddleware, checkRole(adminRoles), billsController.create);

router.put(
  "/:id/status",
  authMiddleware,
  checkRole(adminRoles),
  billsController.updateStatus
);

router.put(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  billsController.update
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole(adminRoles),
  billsController.remove
);

module.exports = router;

