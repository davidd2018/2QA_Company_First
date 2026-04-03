const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/checkRole");
const feedbackController = require("../controllers/feedbackController");

router.get("/", authMiddleware, checkRole(["resident"]), feedbackController.listResident);

router.post("/", authMiddleware, checkRole(["resident"]), feedbackController.create);

module.exports = router;

