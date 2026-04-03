const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/userRepo");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { fullname, email, password, phone, room_number } = req.body;

    const existing = await userRepo.findByEmail(email);
    if (existing) return res.status(400).json({ message: "Email đã tồn tại!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepo.create({ fullname, email, password: hashedPassword, phone, room_number });

    res.status(201).json({ message: "Đăng ký thành công! Đang chờ Admin duyệt." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const user = phone
      ? await userRepo.findByPhone(phone)
      : await userRepo.findByEmail(email);

    if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu không chính xác!" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "SECRET_KEY_CU_DAN",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: { id: user.id, fullname: user.fullname, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
