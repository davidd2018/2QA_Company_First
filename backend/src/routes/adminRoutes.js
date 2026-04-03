const express = require("express");
const router = express.Router();
const { checkRole } = require("../middlewares/checkRole");

// Chỉ Admin và Manager mới vào được đây
router.get(
  "/dashboard-stats",
  checkRole(["admin", "manager"]),
  adminController.getStats,
);
