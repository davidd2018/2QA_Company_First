const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/checkRole");
const billsController = require("../controllers/billsController");

router.get("/", authMiddleware, checkRole(["resident"]), billsController.listResident);

router.post(
  "/:id/pay",
  authMiddleware,
  checkRole(["resident"]),
  billsController.pay
);

module.exports = router;

