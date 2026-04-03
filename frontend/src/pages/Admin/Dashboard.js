import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const fullname = localStorage.getItem("fullname") || "";

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [bills, setBills] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // ===== Notifications form =====
  const [notifEditId, setNotifEditId] = useState(null);
  const [notifForm, setNotifForm] = useState({
    title: "",
    content: "",
    category: "general",
  });

  // ===== Bills form =====
  const [billForm, setBillForm] = useState({
    room_number: "",
    bill_type: "service",
    amount: "",
    usage_value: "",
    month_year: "",
    due_date: "",
    status: "unpaid",
  });

  const [billStatusMap, setBillStatusMap] = useState({});

  // ===== Feedback form (inline update) =====
  const [feedbackUpdateMap, setFeedbackUpdateMap] = useState({});

  const fetchAll = async () => {
    const [nRes, bRes, fRes] = await Promise.all([
      axios.get(`${API_URL}/api/admin/notifications`, { headers }),
      axios.get(`${API_URL}/api/admin/bills`, { headers }),
      axios.get(`${API_URL}/api/admin/feedback`, { headers }),
    ]);

    setNotifications(nRes.data || []);
    setBills(bRes.data || []);
    setFeedbacks(fRes.data || []);
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role === "resident") {
      navigate("/home-resident");
      return;
    }

    fetchAll()
      .catch((err) => {
        alert(err?.response?.data?.message || "Không thể tải dashboard admin");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullname");
    navigate("/login");
  };

  const startEditNotification = (n) => {
    setNotifEditId(n.id);
    setNotifForm({
      title: n.title || "",
      content: n.content || "",
      category: n.category || "general",
    });
  };

  const resetNotificationForm = () => {
    setNotifEditId(null);
    setNotifForm({ title: "", content: "", category: "general" });
  };

  const submitNotification = async (e) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.content) {
      alert("Thiếu title/content");
      return;
    }

    if (notifEditId) {
      await axios.put(`${API_URL}/api/admin/notifications/${notifEditId}`, notifForm, { headers });
    } else {
      await axios.post(`${API_URL}/api/admin/notifications`, notifForm, { headers });
    }

    resetNotificationForm();
    await fetchAll();
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Xóa thông báo?")) return;
    await axios.delete(`${API_URL}/api/admin/notifications/${id}`, { headers });
    await fetchAll();
  };

  const submitBill = async (e) => {
    e.preventDefault();
    if (!billForm.room_number || !billForm.bill_type || !billForm.amount || !billForm.month_year) {
      alert("Thiếu thông tin hóa đơn (room_number, bill_type, amount, month_year).");
      return;
    }

    await axios.post(`${API_URL}/api/admin/bills`, {
      ...billForm,
      amount: Number(billForm.amount),
      usage_value: billForm.usage_value ? Number(billForm.usage_value) : null,
    }, { headers });
    setBillForm({
      room_number: "",
      bill_type: "service",
      amount: "",
      usage_value: "",
      month_year: "",
      due_date: "",
      status: "unpaid",
    });
    await fetchAll();
  };

  const updateBillStatus = async (billId) => {
    const status = billStatusMap[billId];
    if (!status) return alert("Chọn status trước");
    await axios.put(`${API_URL}/api/admin/bills/${billId}/status`, { status }, { headers });
    await fetchAll();
  };

  const deleteBill = async (billId) => {
    if (!window.confirm("Xóa hóa đơn?")) return;
    await axios.delete(`${API_URL}/api/admin/bills/${billId}`, { headers });
    await fetchAll();
  };

  const updateFeedback = async (feedbackId) => {
    const patch = feedbackUpdateMap[feedbackId] || {};
    if (!patch.status) return alert("Chọn status");
    await axios.put(`${API_URL}/api/admin/feedback/${feedbackId}`, {
      status: patch.status,
      assigned_to: patch.assigned_to || null,
    }, { headers });
    await fetchAll();
  };

  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm("Xóa phản ánh?")) return;
    await axios.delete(`${API_URL}/api/admin/feedback/${feedbackId}`, { headers });
    await fetchAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Hệ thống quản trị</h1>
          <p className="text-sm text-gray-600 mt-1">Xin chào, {fullname}</p>
          <p className="text-sm text-blue-700 font-bold mt-1">Quyền: {role?.toUpperCase()}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-full bg-red-50 text-red-700 font-bold hover:bg-red-100 transition"
        >
          Thoát
        </button>
      </div>

      {/* ================= Notifications ================= */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <h2 className="font-extrabold text-gray-900 text-lg mb-3">Quản lý thông báo</h2>

        <form onSubmit={submitNotification} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Title"
            value={notifForm.title}
            onChange={(e) => setNotifForm((p) => ({ ...p, title: e.target.value }))}
          />
          <select
            className="border rounded-xl px-3 py-2"
            value={notifForm.category}
            onChange={(e) => setNotifForm((p) => ({ ...p, category: e.target.value }))}
          >
            <option value="emergency">emergency</option>
            <option value="maintenance">maintenance</option>
            <option value="general">general</option>
            <option value="event">event</option>
          </select>
          <textarea
            className="border rounded-xl px-3 py-2 md:col-span-2"
            placeholder="Content"
            rows={4}
            value={notifForm.content}
            onChange={(e) => setNotifForm((p) => ({ ...p, content: e.target.value }))}
          />

          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl">
              {notifEditId ? "Cập nhật" : "Thêm mới"}
            </button>
            <button
              type="button"
              onClick={resetNotificationForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-xl"
            >
              Hủy
            </button>
          </div>
        </form>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-2">ID</th>
                <th className="py-2 pr-2">Title</th>
                <th className="py-2 pr-2">Category</th>
                <th className="py-2 pr-2">Created</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} className="border-t border-gray-100">
                  <td className="py-2 pr-2">{n.id}</td>
                  <td className="py-2 pr-2">{n.title}</td>
                  <td className="py-2 pr-2">{n.category}</td>
                  <td className="py-2 pr-2">{n.created_at ? new Date(n.created_at).toLocaleString() : "-"}</td>
                  <td className="py-2 pr-2">
                    <div className="flex gap-2">
                      <button
                        className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-lg"
                        onClick={() => startEditNotification(n)}
                      >
                        Sửa
                      </button>
                      <button
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1 rounded-lg"
                        onClick={() => deleteNotification(n.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    Chưa có thông báo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= Bills ================= */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <h2 className="font-extrabold text-gray-900 text-lg mb-3">Quản lý hóa đơn/chi phí</h2>

        <form onSubmit={submitBill} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input className="border rounded-xl px-3 py-2" placeholder="room_number (VD: A1-102)" value={billForm.room_number} onChange={(e)=>setBillForm(p=>({...p,room_number:e.target.value}))}/>
          <select className="border rounded-xl px-3 py-2" value={billForm.bill_type} onChange={(e)=>setBillForm(p=>({...p,bill_type:e.target.value}))}>
            <option value="electricity">electricity</option>
            <option value="water">water</option>
            <option value="service">service</option>
            <option value="parking">parking</option>
          </select>
          <input className="border rounded-xl px-3 py-2" type="number" placeholder="amount" value={billForm.amount} onChange={(e)=>setBillForm(p=>({...p,amount:e.target.value}))}/>

          <input className="border rounded-xl px-3 py-2" type="number" placeholder="usage_value (optional)" value={billForm.usage_value} onChange={(e)=>setBillForm(p=>({...p,usage_value:e.target.value}))}/>
          <input className="border rounded-xl px-3 py-2" placeholder="month_year (VD: 03-2026)" value={billForm.month_year} onChange={(e)=>setBillForm(p=>({...p,month_year:e.target.value}))}/>
          <input className="border rounded-xl px-3 py-2" type="date" value={billForm.due_date} onChange={(e)=>setBillForm(p=>({...p,due_date:e.target.value}))}/>

          <div className="md:col-span-3 flex gap-2 items-center">
            <select className="border rounded-xl px-3 py-2" value={billForm.status} onChange={(e)=>setBillForm(p=>({...p,status:e.target.value}))}>
              <option value="unpaid">unpaid</option>
              <option value="paid">paid</option>
              <option value="overdue">overdue</option>
            </select>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl">
              Thêm hóa đơn
            </button>
          </div>
        </form>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-2">ID</th>
                <th className="py-2 pr-2">Room</th>
                <th className="py-2 pr-2">Type</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2 pr-2">Month</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-t border-gray-100">
                  <td className="py-2 pr-2">{b.id}</td>
                  <td className="py-2 pr-2">{b.room_number}</td>
                  <td className="py-2 pr-2">{b.bill_type}</td>
                  <td className="py-2 pr-2">{b.amount}</td>
                  <td className="py-2 pr-2">{b.month_year}</td>
                  <td className="py-2 pr-2">
                    <span className={b.status === "paid" ? "text-green-700 font-bold" : b.status === "overdue" ? "text-red-700 font-bold" : "text-gray-700 font-bold"}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2 pr-2">
                    <div className="flex gap-2 items-center">
                      <select
                        className="border rounded-lg px-2 py-1"
                        value={billStatusMap[b.id] || ""}
                        onChange={(e)=>setBillStatusMap(p=>({...p,[b.id]: e.target.value}))}
                      >
                        <option value="">Chọn</option>
                        <option value="unpaid">unpaid</option>
                        <option value="paid">paid</option>
                        <option value="overdue">overdue</option>
                      </select>
                      <button
                        className="bg-green-50 hover:bg-green-100 text-green-800 font-bold px-3 py-1 rounded-lg"
                        onClick={() => updateBillStatus(b.id)}
                      >
                        Cập nhật
                      </button>
                      <button
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1 rounded-lg"
                        onClick={() => deleteBill(b.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {bills.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    Chưa có hóa đơn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= Feedback ================= */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-extrabold text-gray-900 text-lg mb-3">Quản lý phản ánh/hỗ trợ</h2>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-2">ID</th>
                <th className="py-2 pr-2">Resident</th>
                <th className="py-2 pr-2">Title</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Assigned</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((f) => (
                <tr key={f.id} className="border-t border-gray-100">
                  <td className="py-2 pr-2">{f.id}</td>
                  <td className="py-2 pr-2">{f.resident_fullname || "-"}</td>
                  <td className="py-2 pr-2">{f.title}</td>
                  <td className="py-2 pr-2">
                    <span className="font-bold">{f.status}</span>
                  </td>
                  <td className="py-2 pr-2">{f.assigned_to || "-"}</td>
                  <td className="py-2 pr-2">
                    <div className="flex gap-2 items-center">
                      <select
                        className="border rounded-lg px-2 py-1"
                        value={feedbackUpdateMap[f.id]?.status || ""}
                        onChange={(e) =>
                          setFeedbackUpdateMap((p) => ({
                            ...p,
                            [f.id]: { ...(p[f.id] || {}), status: e.target.value },
                          }))
                        }
                      >
                        <option value="">Chọn</option>
                        <option value="open">open</option>
                        <option value="in_progress">in_progress</option>
                        <option value="resolved">resolved</option>
                        <option value="closed">closed</option>
                      </select>
                      <input
                        className="border rounded-lg px-2 py-1 w-28"
                        placeholder="assigned_to id"
                        value={feedbackUpdateMap[f.id]?.assigned_to || ""}
                        onChange={(e) =>
                          setFeedbackUpdateMap((p) => ({
                            ...p,
                            [f.id]: { ...(p[f.id] || {}), assigned_to: e.target.value },
                          }))
                        }
                      />
                      <button
                        className="bg-green-50 hover:bg-green-100 text-green-800 font-bold px-3 py-1 rounded-lg"
                        onClick={() => updateFeedback(f.id)}
                      >
                        Cập nhật
                      </button>
                      <button
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1 rounded-lg"
                        onClick={() => deleteFeedback(f.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">
                    Chưa có phản ánh.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
