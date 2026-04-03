const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/userRepo");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword, phone, resident_code, agreeTerms } = req.body;

    // TC02: Kiểm tra trường bắt buộc
    if (!fullname || !email || !password || !confirmPassword || !phone || !resident_code) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!" });
    }

    // TC09: Kiểm tra đồng ý điều khoản
    if (!agreeTerms) {
      return res.status(400).json({ message: "Bạn phải đồng ý với điều khoản sử dụng!" });
    }

    // TC10: Kiểm tra XSS/injection trong họ tên
    const dangerousPattern = /[<>"'`;]|script|select|insert|drop|update|delete/i;
    if (dangerousPattern.test(fullname)) {
      return res.status(400).json({ message: "Họ tên chứa ký tự không hợp lệ!" });
    }

    // TC03: Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Định dạng email không hợp lệ!" });
    }

    // TC04: Kiểm tra độ dài số điện thoại (10-11 số)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Số điện thoại phải có 10-11 chữ số!" });
    }

    // TC07: Kiểm tra độ mạnh mật khẩu (8-32 ký tự)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 8 ký tự, tối đa 32 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)!",
      });
    }

    // TC08: Kiểm tra nhập lại mật khẩu
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu nhập lại không khớp!" });
    }

    // TC05: Kiểm tra mã cư dân có tồn tại không
    const residentUser = await userRepo.findByResidentCode(resident_code);
    if (!residentUser) {
      return res.status(400).json({ message: "Mã cư dân không tồn tại trong danh sách của tòa nhà!" });
    }

    // TC06: Kiểm tra số điện thoại hoặc email đã đăng ký chưa
    const existingPhone = await userRepo.findByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({ message: "Số điện thoại đã được đăng ký!" });
    }

    const existingEmail = await userRepo.findByEmail(email.toLowerCase());
    if (existingEmail) {
      return res.status(400).json({ message: "Email đã được đăng ký!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepo.create({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      room_number: residentUser.room_number || null,
      role: "resident",
      status: "pending",
    });

    res.status(201).json({ message: "Đăng ký thành công! Tài khoản đang chờ Admin duyệt." });
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
