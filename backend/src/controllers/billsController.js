const billRepo = require("../repositories/billRepo");

const listResident = async (req, res) => {
  const rows = await billRepo.findByUser(req.user.id);
  return res.json(rows);
};

const listAdmin = async (_req, res) => {
  const rows = await billRepo.findAll();
  return res.json(rows);
};

const create = async (req, res) => {
  try {
    const item = await billRepo.create(req.body || {});
    return res.status(201).json(item);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: "Thiếu status" });
  const item = await billRepo.updateStatus(req.params.id, status);
  return res.json(item);
};

// Update toàn bộ thông tin bill (admin)
const update = async (req, res) => {
  try {
    const item = await billRepo.update(req.params.id, req.body || {});
    return res.json(item);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Alias: đánh dấu paid
const pay = async (req, res) => {
  const item = await billRepo.updateStatus(req.params.id, "paid");
  return res.json(item);
};

const remove = async (req, res) => {
  await billRepo.remove(req.params.id);
  return res.json({ message: "Đã xóa hóa đơn" });
};

module.exports = { listResident, listAdmin, create, updateStatus, update, pay, remove };
