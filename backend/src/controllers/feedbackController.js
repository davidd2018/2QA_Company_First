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
  if (!title || !content)
    return res.status(400).json({ message: "Thiếu title hoặc content" });

  const item = await feedbackRepo.create({ resident_id: req.user.id, title, content });
  return res.status(201).json(item);
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
