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
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ fullname: "", email: "", phone: "", password: "", room_number: "", role: "resident", status: "active" });
  const [userEditId, setUserEditId] = useState(null);

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
  const [viewFeedback, setViewFeedback] = useState(null); // modal xem nội dung

  const fetchAll = async () => {
    // Dùng allSettled để 1 API lỗi không block các API còn lại
    const [nRes, bRes, fRes, uRes] = await Promise.allSettled([
      axios.get(`${API_URL}/api/admin/notifications`, { headers }),
      axios.get(`${API_URL}/api/admin/bills`, { headers }),
      axios.get(`${API_URL}/api/admin/feedback`, { headers }),
      axios.get(`${API_URL}/api/admin/users`, { headers }),
    ]);

    if (nRes.status === "fulfilled") setNotifications(nRes.value.data || []);
    if (bRes.status === "fulfilled") setBills(bRes.value.data || []);
    if (fRes.status === "fulfilled") setFeedbacks(fRes.value.data || []);
    if (uRes.status === "fulfilled") setUsers(uRes.value.data || []);

    // Log lỗi nếu có để dễ debug
    [nRes, bRes, fRes, uRes].forEach((r, i) => {
      if (r.status === "rejected") {
        const names = ["notifications", "bills", "feedback", "users"];
        console.warn(`API ${names[i]} lỗi:`, r.reason?.response?.data?.message || r.reason?.message);
      }
    });
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
        console.error("fetchAll lỗi:", err?.response?.data?.message || err.message);
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

  const resetUserForm = () => {
    setUserEditId(null);
    setUserForm({ fullname: "", email: "", phone: "", password: "", room_number: "", role: "resident", status: "active" });
  };

  const startEditUser = (u) => {
    setUserEditId(u.id);
    setUserForm({ fullname: u.fullname || "", email: u.email || "", phone: u.phone || "", password: "", room_number: u.room_number || "", role: u.role || "resident", status: u.status || "active" });
  };

  const submitUser = async (e) => {
    e.preventDefault();
    if (!userForm.fullname || !userForm.phone) return alert("Thiếu họ tên hoặc số điện thoại");
    if (!userEditId && !userForm.password) return alert("Thiếu mật khẩu");
    if (userEditId) {
      const payload = { ...userForm };
      if (!payload.password) delete payload.password;
      await axios.put(`${API_URL}/api/admin/users/${userEditId}`, payload, { headers });
    } else {
      await axios.post(`${API_URL}/api/admin/users`, userForm, { headers });
    }
    resetUserForm();
    await fetchAll();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Xóa tài khoản này?")) return;
    await axios.delete(`${API_URL}/api/admin/users/${id}`, { headers });
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
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
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
                      <button
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg"
                        onClick={() => setViewFeedback(f)}
                      >
                        Xem
                      </button>
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
      {/* ================= Users ================= */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-gray-900 text-lg">Danh sách cư dân</h2>
          <span className="text-sm text-gray-400">{users.length} tài khoản</span>
        </div>

        {/* Form thêm/sửa */}
        <form onSubmit={submitUser} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input className="border rounded-xl px-3 py-2" placeholder="Họ tên *" value={userForm.fullname} onChange={(e) => setUserForm(p => ({ ...p, fullname: e.target.value }))} />
          <input className="border rounded-xl px-3 py-2" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))} />
          <input className="border rounded-xl px-3 py-2" placeholder="Số điện thoại *" value={userForm.phone} onChange={(e) => setUserForm(p => ({ ...p, phone: e.target.value }))} />
          <input className="border rounded-xl px-3 py-2" placeholder={userEditId ? "Mật khẩu mới (để trống = giữ nguyên)" : "Mật khẩu *"} type="password" value={userForm.password} onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))} />
          <input className="border rounded-xl px-3 py-2" placeholder="Phòng (VD: A1-101)" value={userForm.room_number} onChange={(e) => setUserForm(p => ({ ...p, room_number: e.target.value }))} />
          <div className="flex gap-2">
            <select className="border rounded-xl px-3 py-2 flex-1" value={userForm.role} onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))}>
              <option value="resident">resident</option>
              <option value="staff">staff</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </select>
            <select className="border rounded-xl px-3 py-2 flex-1" value={userForm.status} onChange={(e) => setUserForm(p => ({ ...p, status: e.target.value }))}>
              <option value="active">active</option>
              <option value="pending">pending</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div className="md:col-span-3 flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl">
              {userEditId ? "Cập nhật" : "Thêm tài khoản"}
            </button>
            {userEditId && (
              <button type="button" onClick={resetUserForm} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-xl">
                Hủy
              </button>
            )}
          </div>
        </form>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Họ tên</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Số điện thoại</th>
                <th className="py-2 pr-4">Phòng</th>
                <th className="py-2 pr-4">Vai trò</th>
                <th className="py-2 pr-4">Trạng thái</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-slate-50 transition">
                  <td className="py-2 pr-4 text-gray-400">{u.id}</td>
                  <td className="py-2 pr-4 font-medium text-gray-800">{u.fullname}</td>
                  <td className="py-2 pr-4 text-gray-600">{u.email || "-"}</td>
                  <td className="py-2 pr-4 text-gray-600">{u.phone || "-"}</td>
                  <td className="py-2 pr-4">{u.room_number || "-"}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : u.role === "manager" ? "bg-blue-100 text-blue-700" : u.role === "staff" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.status === "active" ? "bg-green-100 text-green-700" : u.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEditUser(u)} className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-lg">Sửa</button>
                      <button onClick={() => deleteUser(u.id)} className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1 rounded-lg">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="8" className="py-4 text-center text-gray-400">Chưa có tài khoản nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Modal Xem Nội Dung Phản Ánh (Admin) ===== */}
      {viewFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">{viewFeedback.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Từ: <span className="font-medium text-gray-600">{viewFeedback.resident_fullname || "-"}</span>
                  {" · "}
                  {viewFeedback.created_at ? new Date(viewFeedback.created_at).toLocaleString() : ""}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ml-4 ${
                viewFeedback.status === "open" ? "bg-yellow-100 text-yellow-700" :
                viewFeedback.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                viewFeedback.status === "resolved" ? "bg-green-100 text-green-700" :
                "bg-gray-100 text-gray-500"
              }`}>
                {viewFeedback.status}
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {viewFeedback.content}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewFeedback(null)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-700 text-white font-bold rounded-xl text-sm transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
