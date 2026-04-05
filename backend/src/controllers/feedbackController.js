const feedbackRepo = require("../repositories/feedbackRepo");

const listResident = async (req, res) => {
  const rows = await feedbackRepo.findByResident(req.user.id);
  return res.json(rows);
};

const listAdmin = async (_req, res) => {
  const rows = await feedbackRepo.findAll();
  return res.json(rows);
};

const create = async (req, res) => {
  const { title, content } = req.body || {};

  if (!title)
    return res.status(400).json({ message: "Vui lòng nhập tiêu đề phản ánh!" });

  if (!content)
    return res.status(400).json({ message: "Vui lòng nhập nội dung phản ánh!" });

  if (content.length < 10)
    return res.status(400).json({ message: "Nội dung phản ánh phải có ít nhất 10 ký tự!" });

  if (content.length > 1000)
    return res.status(400).json({ message: "Nội dung phản ánh không được vượt quá 1000 ký tự!" });

  const dangerousPattern = /[<>"'`;]|script|select|insert|drop|update|delete/i;
  if (dangerousPattern.test(title))
    return res.status(400).json({ message: "Tiêu đề chứa ký tự không hợp lệ!" });

  const item = await feedbackRepo.create({ resident_id: req.user.id, title, content });
  const { password, token: _token, ...safeItem } = item;
  return res.status(201).json(safeItem);
};

const update = async (req, res) => {
  const { status, assigned_to } = req.body || {};
  if (!status) return res.status(400).json({ message: "Thiếu status" });

  const item = await feedbackRepo.update(req.params.id, { status, assigned_to });
  return res.json(item);
};

const remove = async (req, res) => {
  await feedbackRepo.remove(req.params.id);
  return res.json({ message: "Đã xóa phản ánh" });
};

module.exports = { listResident, listAdmin, create, update, remove };
