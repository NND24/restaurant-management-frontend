"use client";
import React from "react";
import Image from "next/image";

const SupportPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl w-full text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/logo.jpg" // ✅ Replace with your support illustration image
            alt="Support Center"
            width={150}
            height={150}
          />
        </div>
        <h1 className="text-3xl font-bold text-[#333] mb-3">
          Trung tâm hỗ trợ
        </h1>
        <p className="text-gray-600 mb-6">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn. Nếu bạn gặp bất kỳ sự cố nào liên quan đến tài khoản hoặc dịch vụ, vui lòng liên hệ với chúng tôi qua các kênh sau:
        </p>

        <div className="text-left space-y-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#555]">📧 Email hỗ trợ:</h2>
            <p className="text-gray-700">support@example.com</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#555]">📞 Hotline:</h2>
            <p className="text-gray-700">(+84) 123 456 789</p>
          </div>
        </div>

        <a
          href="/home"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition"
        >
          Quay lại trang chủ
        </a>
      </div>
    </div>
  );
};

export default SupportPage;
