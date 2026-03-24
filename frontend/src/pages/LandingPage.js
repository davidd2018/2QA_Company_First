import React from "react";
import { Bell, CreditCard, Wrench, ArrowRight } from "lucide-react";

const LandingPage = () => {
  // Hàm bổ trợ để cuộn mượt mà (tùy chọn nếu bạn muốn xử lý bằng JS)
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans scroll-smooth">
      {/* Navbar mờ ảo (Glassmorphism) */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">2QA Apartment</h1>

        {/* Menu điều hướng nội bộ */}
        <div className="hidden md:flex space-x-8 items-center">
          <a
            href="#"
            className="text-gray-600 hover:text-blue-600 font-medium transition"
          >
            Trang chủ
          </a>
          <a
            href="#features"
            className="text-gray-600 hover:text-blue-600 font-medium transition"
          >
            Tiện ích
          </a>
          <a
            href="#about"
            className="text-gray-600 hover:text-blue-600 font-medium transition"
          >
            Giới thiệu
          </a>
          <a
            href="#contact"
            className="text-gray-600 hover:text-blue-600 font-medium transition"
          >
            Liên hệ
          </a>
        </div>

        <div className="space-x-4">
          <a
            href="/register"
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-md font-medium"
          >
            Tham gia
          </a>
        </div>
      </nav>

      {/* Hero Section - Đóng vai trò Trang chủ */}
      <section
        id="home"
        className="relative h-screen flex items-center justify-center text-center px-4"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80"
            className="w-full h-full object-cover"
            alt="Modern Building"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-3xl text-white">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Chào mừng bạn đến với không gian sống hiện đại
          </h2>
          <p className="text-lg md:text-xl mb-10 text-gray-200 leading-relaxed">
            Hệ thống quản lý căn hộ thông minh giúp bạn theo dõi hóa đơn, nhận
            thông báo và gửi phản ánh chỉ trong vài giây.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => (window.location.href = "/activate")}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition"
            >
              Bắt đầu ngay <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - Tiện ích */}
      <section
        id="features"
        className="py-24 px-6 md:px-12 bg-slate-50 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-800">
              Tiện ích dành riêng cho cư dân
            </h3>
            <p className="text-gray-500 mt-2">
              Mọi dịch vụ đều nằm gọn trong điện thoại của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3">🔔 Thông báo</h4>
              <p className="text-gray-600">
                Luôn cập nhật tin tức quan trọng, lịch cắt điện nước từ Ban quản
                lý.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3">💳 Thanh toán</h4>
              <p className="text-gray-600">
                Thanh toán hóa đơn điện, nước, phí quản lý nhanh chóng qua ví
                điện tử.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wrench size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3">🛠 Phản ánh</h4>
              <p className="text-gray-600">
                Gửi yêu cầu sửa chữa cơ sở vật chất và theo dõi tiến độ xử lý
                trực tiếp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Giới thiệu */}
      <section id="about" className="py-24 px-6 md:px-12 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
              alt="About 2QA"
              className="rounded-2xl shadow-lg"
            />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 font-sans">
              Về 2QA Apartment Building
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              2QA không chỉ là một tòa nhà, đó là một cộng đồng sống văn minh và
              hiện đại. Chúng tôi áp dụng công nghệ vào quản lý để mang lại sự
              tiện nghi tối đa cho cư dân.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Với vị trí đắc địa và dịch vụ quản lý chuyên nghiệp, chúng tôi cam
              kết mang lại môi trường sống an toàn, sạch đẹp và thông minh nhất.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section - Liên hệ */}
      <section
        id="contact"
        className="py-24 px-6 md:px-12 bg-blue-600 text-white scroll-mt-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">Kết nối với chúng tôi</h3>
          <p className="mb-10 text-blue-100">
            Bạn có câu hỏi hoặc cần hỗ trợ kỹ thuật? Đừng ngần ngại liên hệ.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <p className="font-bold">Hotline BQL</p>
              <p className="text-blue-200">1900 1234</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <p className="font-bold">Email hỗ trợ</p>
              <p className="text-blue-200">support@2qa.com</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <p className="font-bold">Địa chỉ</p>
              <p className="text-blue-200">Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 text-center">
        <p className="text-2xl font-bold mb-4 text-blue-400">
          2QA Apartment Building
        </p>
        <p className="text-gray-400">© 2026 Toàn bộ quyền lợi được bảo lưu.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
