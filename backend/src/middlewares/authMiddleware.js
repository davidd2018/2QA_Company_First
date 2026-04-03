const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : null;
  if (!token) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }

  try {
    const secret = process.env.JWT_SECRET || "SECRET_KEY_CU_DAN";
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }
};

module.exports = authMiddleware;

