const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register); // KIỂM TRA DÒNG NÀY
router.post("/login", authController.login);

module.exports = router;
