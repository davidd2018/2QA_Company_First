import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Phone, Lock, ShieldCheck, Headset } from "lucide-react";
// Import dữ liệu mockup từ file json
import residentsMock from "../mock/resident.json";

const ActivateAccount = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Xử lý kiểm tra Số điện thoại bằng Mock Data
  const checkPhoneMock = (e) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập độ trễ của mạng (500ms)
    setTimeout(() => {
      // Tìm cư dân trong file json mockup
      const user = residentsMock.find((r) => r.phone === phone);

      if (user) {
        // Nếu đã có mật khẩu nghĩa là đã kích hoạt rồi
        if (user.isActive) {
          alert("Số điện thoại này đã được kích hoạt tài khoản trước đó!");
        } else {
          setStep(2); // Cho phép sang bước đặt mật khẩu
        }
      } else {
        alert("Số điện thoại không có trong dữ liệu cư dân của BQL!");
      }
      setLoading(false);
    }, 500);
  };

  // 2. Xử lý kích hoạt mật khẩu (Giả lập lưu thành công)
  const handleActivateMock = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Giả lập lưu vào "Bộ nhớ tạm" của trình duyệt
      const updatedUser = {
        phone: phone,
        password: password, // Mật khẩu mới B vừa nhập
        isActive: true,
      };

      // Lưu lại để trang Login có thể kiểm tra
      localStorage.setItem(
        `activated_user_${phone}`,
        JSON.stringify(updatedUser),
      );

      alert(
        "Kích hoạt thành công! Bây giờ bạn có thể đăng nhập với mật khẩu vừa tạo.",
      );
      navigate("/login");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Kích Hoạt Cư Dân</h2>
          <p className="text-gray-500 mt-2 text-sm font-sans">
            Dành cho cư dân đã có thông tin tại 2QA Apartment
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={checkPhoneMock} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại đã đăng ký
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Phone size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Nhập số điện thoại (VD: 0901234567)"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:bg-blue-300"
            >
              {loading ? "Đang kiểm tra..." : "Tiếp tục"}
            </button>

            <div className="bg-amber-50 p-4 rounded-lg flex gap-3 items-start border border-amber-100">
              <Headset className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-800 leading-relaxed font-sans">
                Nếu hệ thống báo lỗi, vui lòng mang CCCD đến văn phòng BQL tại
                tầng trệt để cập nhật thông tin.
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleActivateMock} className="space-y-6">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-sm font-medium text-center mb-4">
              Xác nhận thành công cư dân: {phone}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Thiết lập mật khẩu mới
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:bg-green-300"
            >
              {loading ? "Đang xử lý..." : "Kích hoạt ngay"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-blue-600 text-sm font-medium hover:underline font-sans"
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;
