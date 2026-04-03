const notificationRepo = require("../repositories/notificationRepo");

const listAll = async (_req, res) => {
  const rows = await notificationRepo.findAll();
  return res.json(rows);
};

const listAdmin = listAll;

const create = async (req, res) => {
  const { title, content, category } = req.body || {};
  if (!title || !content)
    return res.status(400).json({ message: "Thiếu title hoặc content" });

  const item = await notificationRepo.create({ title, content, category, author_id: req.user.id });
  return res.status(201).json(item);
};

const update = async (req, res) => {
  const { title, content, category } = req.body || {};
  if (!title || !content)
    return res.status(400).json({ message: "Thiếu title hoặc content" });

  const item = await notificationRepo.update(req.params.id, { title, content, category });
  return res.json(item);
};

const remove = async (req, res) => {
  await notificationRepo.remove(req.params.id);
  return res.json({ message: "Đã xóa thông báo" });
};

module.exports = { listAll, listAdmin, create, update, remove };
