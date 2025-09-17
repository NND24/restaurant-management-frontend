"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 px-4'>
      <div className='bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center'>
        {/* Icon + Title */}
        <div className='flex flex-col items-center mb-4'>
          <AlertTriangle className='text-red-500 w-12 h-12 mb-2' />
          <h1 className='text-2xl font-bold text-red-600'>Truy cập bị từ chối</h1>
        </div>

        {/* Description */}
        <p className='text-gray-600 mb-8 leading-relaxed'>
          Bạn không có quyền truy cập vào trang này.
          <br />
          Vui lòng đăng nhập lại hoặc quay về trang chủ.
        </p>

        {/* Actions */}
        <div className='flex flex-col gap-4'>
          <button
            onClick={() => router.push("/home")}
            className='px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-300 text-white font-semibold transition'
          >
            Về trang chủ
          </button>
          <button
            onClick={() => router.push("/auth/login")}
            className='px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
