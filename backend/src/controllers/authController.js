const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. ĐĂNG KÝ (Register)
exports.register = async (req, res) => {
  try {
    const { fullname, email, password, phone, room_number } = req.body;

    // Kiểm tra email tồn tại
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0)
      return res.status(400).json({ message: "Email đã tồn tại!" });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Lưu User mới (Mặc định role: resident, status: pending)
    const sql =
      "INSERT INTO users (fullname, email, password, phone, room_number) VALUES (?, ?, ?, ?, ?)";
    await db.query(sql, [fullname, email, hashedPassword, phone, room_number]);

    res
      .status(201)
      .json({ message: "Đăng ký thành công! Đang chờ Admin duyệt." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. ĐĂNG NHẬP (Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(400).json({ message: "Tài khoản không tồn tại!" });

    const user = users[0];

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không chính xác!" });

    // Tạo JWT Token (Hết hạn sau 1 ngày)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "SECRET_KEY_CU_DAN",
      { expiresIn: "1d" },
    );

    // Trả về token và thông tin cần thiết cho Frontend
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
