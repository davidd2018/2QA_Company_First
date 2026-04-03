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
  const { title, content, category, attachment_type, contact } = req.body || {};

  // TC02: Thiếu tiêu đề
  if (!title)
    return res.status(400).json({ message: "Vui lòng nhập tiêu đề phản ánh!" });

  // TC03: Thiếu nội dung
  if (!content)
    return res.status(400).json({ message: "Vui lòng nhập nội dung phản ánh!" });

  // TC04: Nội dung quá ngắn
  if (content.length < 10)
    return res.status(400).json({ message: "Nội dung phản ánh phải có ít nhất 10 ký tự!" });

  // TC05: Nội dung quá dài
  if (content.length > 1000)
    return res.status(400).json({ message: "Nội dung phản ánh không được vượt quá 1000 ký tự!" });

  // TC06: Tiêu đề chứa ký tự nguy hiểm (SQL Injection / XSS)
  const dangerousPattern = /[<>"'`;]|script|select|insert|drop|update|delete/i;
  if (dangerousPattern.test(title))
    return res.status(400).json({ message: "Tiêu đề chứa ký tự không hợp lệ!" });

  // TC07: Thiếu loại phản ánh
  const validCategories = ["complaint", "suggestion", "bug"];
  if (!category || !validCategories.includes(category))
    return res.status(400).json({ message: "Vui lòng chọn loại phản ánh hợp lệ (complaint, suggestion, bug)!" });

  // TC08: File đính kèm không đúng định dạng
  const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "doc", "docx"];
  if (attachment_type) {
    const ext = attachment_type.toLowerCase().trim();
    if (!allowedExtensions.includes(ext))
      return res.status(400).json({ message: "Định dạng file đính kèm không được hỗ trợ!" });
  }

  // TC09: Thiếu thông tin liên hệ (email hoặc phone)
  if (!contact || (!contact.email && !contact.phone))
    return res.status(400).json({ message: "Vui lòng cung cấp email hoặc số điện thoại liên hệ!" });

  const item = await feedbackRepo.create({ resident_id: req.user.id, title, content, category });

  // TC10: Không trả về trường nhạy cảm
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
