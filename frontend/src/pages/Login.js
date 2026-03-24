import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, LogIn, Phone } from "lucide-react";
// Import dữ liệu mockup
import residentsMock from "../mock/resident.json";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginMock = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // 1. Kiểm tra xem user này đã được kích hoạt và lưu trong localStorage chưa
      const localUserData = localStorage.getItem(
        `activated_user_${formData.phone}`,
      );
      const activatedUser = localUserData ? JSON.parse(localUserData) : null;

      // 2. Tìm trong file JSON gốc
      const originalUser = residentsMock.find(
        (r) => r.phone === formData.phone,
      );

      const user = activatedUser || originalUser;

      if (!user) {
        alert("Số điện thoại không tồn tại!");
      } else if (!user.isActive && !activatedUser) {
        alert("Tài khoản chưa kích hoạt!");
        navigate("/activate");
      } else if (formData.password !== user.password) {
        alert("Sai mật khẩu!");
      } else {
        localStorage.setItem("userPhone", user.phone);
        alert(`Đăng nhập thành công!`);
        navigate("/home-resident");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        {/* Bên trái: Hình ảnh Branding */}
        <div className="hidden md:block md:w-1/2 bg-blue-600 relative">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80"
            alt="Apartment"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="relative z-10 p-12 text-white h-full flex flex-col justify-end">
            <h2 className="text-4xl font-bold mb-4">2QA Apartment</h2>
            <p className="text-lg opacity-90">
              Cổng thông tin cư dân thông minh. Quản lý cuộc sống của bạn chỉ
              với vài cú chạm.
            </p>
          </div>
        </div>

        {/* Bên phải: Form Đăng nhập */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng!</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Vui lòng đăng nhập để tiếp tục
          </p>

          <form className="space-y-6" onSubmit={handleLoginMock}>
            {/* Input Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Phone size={18} />
                </span>
                <input
                  name="phone"
                  type="text"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="0901234567"
                />
              </div>
            </div>

            {/* Input Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition disabled:bg-blue-300"
            >
              {loading ? "Đang xác thực..." : "Đăng Nhập"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              Chưa kích hoạt tài khoản cư dân?{" "}
              <Link
                to="/activate"
                className="text-blue-600 font-bold hover:underline"
              >
                Kích hoạt ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
