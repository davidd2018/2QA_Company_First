const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Chưa xác thực" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Không đủ quyền" });
    }

    return next();
  };
};

module.exports = { checkRole };

