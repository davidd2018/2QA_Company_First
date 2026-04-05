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

const update = async (req, res) => {
  try {
    const item = await billRepo.update(req.params.id, req.body || {});
    return res.json(item);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// TC01, TC03, TC04, TC05, TC09: Thanh toán hóa đơn
const pay = async (req, res) => {
  try {
    const bill = await billRepo.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Hóa đơn không tồn tại!" });

    // TC04 / TC09: Chặn thanh toán trùng (double-charge)
    if (bill.status === "paid")
      return res.status(400).json({ message: "Hóa đơn này đã được thanh toán!" });

    const { payment_method, balance } = req.body || {};

    // TC01: Kiểm tra phương thức thanh toán hợp lệ
    const validMethods = ["e_wallet", "bank_transfer", "cash"];
    if (!payment_method || !validMethods.includes(payment_method))
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ!" });

    // TC03: Kiểm tra số dư
    if (balance !== undefined && Number(balance) < Number(bill.amount))
      return res.status(400).json({ message: "Số dư tài khoản không đủ để thanh toán!" });

    // TC05: Tính phí phạt nếu quá hạn
    let finalAmount = Number(bill.amount);
    let lateFee = 0;
    if (bill.status === "overdue" && bill.due_date) {
      const daysLate = Math.floor((Date.now() - new Date(bill.due_date)) / 86400000);
      lateFee = Math.round(finalAmount * 0.02 * Math.max(daysLate, 0)); // 2%/ngày
      finalAmount += lateFee;
    }

    const item = await billRepo.updateStatus(req.params.id, "paid");
    return res.json({ ...item, late_fee: lateFee, final_amount: finalAmount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// TC06: Thanh toán một phần (partial payment)
const partialPay = async (req, res) => {
  try {
    const bill = await billRepo.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Hóa đơn không tồn tại!" });
    if (bill.status === "paid")
      return res.status(400).json({ message: "Hóa đơn này đã được thanh toán!" });

    const { amount_paid } = req.body || {};
    if (!amount_paid || Number(amount_paid) <= 0)
      return res.status(400).json({ message: "Số tiền thanh toán không hợp lệ!" });
    if (Number(amount_paid) >= Number(bill.amount))
      return res.status(400).json({ message: "Dùng API thanh toán đầy đủ cho trường hợp này!" });

    const remaining = Number(bill.amount) - Number(amount_paid);
    return res.json({ bill_id: bill.id, amount_paid: Number(amount_paid), remaining, status: bill.status });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// TC07: Hủy giao dịch
const cancelPayment = async (req, res) => {
  try {
    const bill = await billRepo.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Hóa đơn không tồn tại!" });
    if (bill.status === "paid")
      return res.status(400).json({ message: "Không thể hủy giao dịch đã hoàn thành!" });

    return res.json({ message: "Đã hủy giao dịch. Hóa đơn vẫn ở trạng thái chưa thanh toán.", bill });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// TC08: Tải biên lai PDF (trả về metadata, file thực tế do frontend/service tạo)
const getReceipt = async (req, res) => {
  try {
    const bill = await billRepo.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Hóa đơn không tồn tại!" });
    if (bill.status !== "paid")
      return res.status(400).json({ message: "Chỉ có thể tải biên lai cho hóa đơn đã thanh toán!" });

    return res.json({
      receipt: {
        bill_id: bill.id,
        room_number: bill.room_number || null,
        bill_type: bill.bill_type,
        amount: bill.amount,
        month_year: bill.month_year,
        paid_at: new Date().toISOString(),
        format: "pdf",
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// TC10: Lịch sử thanh toán 6 tháng gần nhất
const paymentHistory = async (req, res) => {
  try {
    const rows = await billRepo.findByUser(req.user.id);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const history = rows.filter((b) => {
      if (b.status !== "paid") return false;
      if (!b.created_at) return true;
      return new Date(b.created_at) >= sixMonthsAgo;
    });

    return res.json(history);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// TC02: Tổng số tiền nợ của căn hộ
const getDebt = async (req, res) => {
  try {
    const rows = await billRepo.findByUser(req.user.id);
    const unpaid = rows.filter((b) => b.status !== "paid");
    const total = unpaid.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    return res.json({ total_debt: total, bills: unpaid });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  await billRepo.remove(req.params.id);
  return res.json({ message: "Đã xóa hóa đơn" });
};

module.exports = {
  listResident, listAdmin, create, updateStatus, update,
  pay, partialPay, cancelPayment, getReceipt, paymentHistory, getDebt,
  remove,
};
