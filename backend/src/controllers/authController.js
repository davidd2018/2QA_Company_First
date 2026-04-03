const dbPromise = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. ĐĂNG KÝ
exports.register = async (req, res) => {
  try {
    const db = await dbPromise;
    const { fullname, email, password, phone, room_number } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0)
      return res.status(400).json({ message: "Email đã tồn tại!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      "INSERT INTO users (fullname, email, password, phone, room_number) VALUES (?, ?, ?, ?, ?)",
      [fullname, email, hashedPassword, phone, room_number]
    );

    res.status(201).json({ message: "Đăng ký thành công! Đang chờ Admin duyệt." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. ĐĂNG NHẬP
exports.login = async (req, res) => {
  try {
    const db = await dbPromise;
    const { email, phone, password } = req.body;

    const whereClause = phone ? "phone" : "email";
    const lookupValue = phone || email;

    const [users] = await db.query(
      `SELECT * FROM users WHERE ${whereClause} = ?`,
      [lookupValue]
    );
    if (users.length === 0)
      return res.status(400).json({ message: "Tài khoản không tồn tại!" });

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không chính xác!" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "SECRET_KEY_CU_DAN",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
