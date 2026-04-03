import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Bell,
  Wrench,
  LogOut,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import mockResidents from "../../mock/resident.json";

const HomeResident = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [bills, setBills] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const fullname = localStorage.getItem("fullname") || "";
  const token = localStorage.getItem("token");

  const pendingFee = bills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const openFeedbackCount = feedbacks.filter((f) =>
    ["open", "in_progress"].includes(f.status),
  ).length;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const [nRes, bRes, fRes] = await Promise.all([
          axios.get(`${API_URL}/api/resident/notifications`, { headers }),
          axios.get(`${API_URL}/api/resident/bills`, { headers }),
          axios.get(`${API_URL}/api/resident/feedback`, { headers }),
        ]);

        setNotifications(nRes.data || []);
        setBills(bRes.data || []);
        setFeedbacks(fRes.data || []);
      } catch (err) {
        // Nếu API lỗi, dùng mock data để vẫn hiển thị được trang
        console.warn("API không khả dụng, dùng mock data:", err.message);
        const phone = localStorage.getItem("phone") || "";
        const mockUser = mockResidents.find((r) => r.phone === phone) || mockResidents[0];
        setNotifications([
          { id: 1, title: "Bảo trì thang máy", category: "maintenance", created_at: new Date().toISOString() },
          { id: 2, title: "Lễ hội cư dân 2026", category: "event", created_at: new Date().toISOString() },
        ]);
        setBills([
          { id: 1, room_number: mockUser?.room || "-", bill_type: "electricity", amount: 350000, month_year: "03-2026", status: "unpaid" },
          { id: 2, room_number: mockUser?.room || "-", bill_type: "water", amount: 120000, month_year: "03-2026", status: "unpaid" },
        ]);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullname");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar giống LandingPage - Glassmorphism */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-blue-700 tracking-tight">
            2QA APARTMENT
          </h1>

          {/* Menu chính cho Cư dân */}
          <div className="hidden md:flex space-x-6 items-center">
            <button className="text-blue-600 font-bold text-sm">
              Tổng quan
            </button>
            <button className="text-gray-500 hover:text-blue-600 font-medium text-sm transition">
              Hóa đơn
            </button>
            <button className="text-gray-500 hover:text-blue-600 font-medium text-sm transition">
              Thông báo
            </button>
            <button className="text-gray-500 hover:text-blue-600 font-medium text-sm transition">
              Hỗ trợ
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-800 leading-none">
              {fullname}
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1">
              Phòng {bills[0]?.room_number || "-"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition text-sm font-bold"
          >
            <LogOut size={16} /> <span className="hidden md:inline">Thoát</span>
          </button>
        </div>
      </nav>

      {/* Main Content Space */}
      <main className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header chào hỏi */}
        <header className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Xin chào, {fullname ? fullname.split(" ").pop() : ""}! 👋
          </h2>
          <p className="text-gray-500 mt-2">
            Chào mừng bạn trở lại với cổng thông tin cư dân.
          </p>
        </header>

        {/* Khu vực hành động nhanh (Quick Actions) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                <CreditCard size={24} />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Phí cần thanh toán
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {pendingFee ? pendingFee.toLocaleString() : "0"}đ
              </h3>
            </div>
            <button className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition">
              Thanh toán ngay
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Bell size={24} />
              </div>
              <p className="text-sm font-medium text-gray-500">Thông báo mới</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {Math.min(3, notifications.length)} tin mới
              </h3>
            </div>
            <button className="mt-6 w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition">
              Xem bảng tin
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                <Wrench size={24} />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Yêu cầu hỗ trợ
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {openFeedbackCount} yêu cầu
              </h3>
            </div>
            <button className="mt-6 w-full py-3 bg-orange-50 text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-100 transition">
              Gửi yêu cầu
            </button>
          </div>
        </div>

        {/* Nội dung chi tiết phía dưới */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tin tức gần đây */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-900 text-lg">
                Tin tức tòa nhà
              </h4>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1">
                Tất cả <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-6">
              {notifications.slice(0, 2).map((n) => (
                <div
                  key={n.id}
                  className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0"
                >
                  <div className="bg-slate-100 w-20 h-20 rounded-2xl shrink-0 object-cover"></div>
                  <div>
                    <h5 className="font-bold text-gray-800 leading-snug">
                      {n.title}
                    </h5>
                    <p className="text-xs text-gray-400 mt-1">
                      {n.category} •{" "}
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-sm text-gray-500">Chưa có thông báo.</div>
              )}
            </div>
          </div>

          {/* Thông tin căn hộ */}
          <div className="bg-blue-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-6">Thông tin thành viên</h4>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-white/10 text-sm">
                  <span className="opacity-70">Chủ hộ</span>
                  <span className="font-bold">{fullname}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10 text-sm">
                  <span className="opacity-70">Mã căn hộ</span>
                  <span className="font-bold">
                    {bills[0]?.room_number || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <span className="opacity-70">Trạng thái</span>
                  <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full font-bold text-[10px] uppercase">
                    Đang cư trú
                  </span>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h5 className="font-bold text-sm mb-3">Hóa đơn gần đây</h5>
                  <div className="space-y-2">
                    {bills.slice(0, 3).map((b) => (
                      <div key={b.id} className="flex justify-between text-xs">
                        <span className="opacity-80">{b.month_year}</span>
                        <span className="font-bold">
                          {b.bill_type}:{" "}
                          {b.amount?.toLocaleString ? b.amount.toLocaleString() : b.amount}đ
                        </span>
                      </div>
                    ))}
                    {bills.length === 0 && (
                      <div className="text-xs opacity-80">Chưa có hóa đơn.</div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h5 className="font-bold text-sm mb-3">Phản ánh gần đây</h5>
                  <div className="space-y-2">
                    {feedbacks.slice(0, 3).map((f) => (
                      <div key={f.id} className="text-xs">
                        <div className="font-bold">{f.title}</div>
                        <div className="opacity-80">
                          {f.status} •{" "}
                          {f.created_at ? new Date(f.created_at).toLocaleString() : "-"}
                        </div>
                      </div>
                    ))}
                    {feedbacks.length === 0 && (
                      <div className="text-xs opacity-80">Chưa có phản ánh.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Trang trí hình tròn mờ ảo phía sau */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeResident;
