"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { loginUser, getOwnStore, logoutUser } from "@/service/auth";
import localStorageService from "@/utils/localStorageService";
import { useAuth } from "@/context/AuthContext";
import Heading from "@/components/Heading";

const Page = () => {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const schema = yup.object().shape({
    email: yup.string().email("Email không hợp lệ!").required("Vui lòng nhập Email!"),
    password: yup.string().required("Vui lòng nhập mật khẩu!"),
  });
  const getRole = localStorageService.getRole();
  const { user, setUser, setUserId } = useAuth();

  const checkStoreStatus = async () => {
    try {
      const storeResult = await getOwnStore();
      const storeData = storeResult.data;

      if (storeData.status == "APPROVED") {
        return "APPROVED";
      } else if (storeData.status == "PENDING") {
        return "PENDING";
      } else if (storeData.status == "BLOCKED") {
        return "BLOCKED";
      }
      if (!storeResult.data || !storeResult.success) {
        if (storeResult.message == "No store found for this user") {
          return "NOT_REGISTERED";
        }
        toast.error(storeResult.message || "Lỗi khi lấy thông tin cửa hàng!");
        return "NONE";
      }
    } catch (err) {
      console.error("Error checking store status:", err);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      const status = await checkStoreStatus();
      switch (status) {
        case "APPROVED":
          router.push(getRole !== "staff" ? "/statistic/revenue" : "/orders/current");
          break;
        case "PENDING":
          router.push("/auth/verification-pending");
          break;
        case "BLOCKED":
          router.push("/auth/blocked");
          break;
        case "NOT_REGISTERED":
          localStorageService.clearAll();
          await logoutUser();
          router.push("/auth/register");
          break;
        case "NONE":
          // No action (let user login)
          break;
        default:
          break;
      }
    };
    checkStatus();
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const loginResult = await loginUser(values);
        if (!loginResult.success) {
          toast.error(loginResult.message || "Đăng nhập thất bại!");
          return;
        }

        const status = await checkStoreStatus();
        switch (status) {
          case "APPROVED":
            toast.success("Đăng nhập thành công!");
            router.push(getRole !== "staff" ? "/statistic/revenue" : "/orders/current");
            break;
          case "PENDING":
            toast.success("Đăng nhập thành công!");
            router.push("/auth/verification-pending");
            break;
          case "BLOCKED":
            toast.success("Đăng nhập thành công!");
            router.push("/auth/blocked");
            break;
          case "NOT_REGISTERED":
            toast.error("Bạn chưa đăng ký cửa hàng!");
            localStorageService.clearAll();
            await logoutUser();
            router.push("/auth/register");
            break;
          default:
            break;
        }
      } catch (err) {
        toast.error("Đăng nhập thất bại!");
      }
      formik.resetForm();
    },
  });

  return (
    <div className='min-h-screen flex'>
      <Heading title='Đăng nhập' description='' keywords='' />
      {/* Left Image */}
      <div className='hidden md:flex w-1/2 bg-gradient-to-br from-orange-200 to-orange-400 items-center justify-center'>
        <Image
          src='/assets/login_banner.png'
          alt='Login banner'
          width={500}
          height={500}
          className='object-cover rounded-l-lg'
        />
      </div>

      {/* Right Form */}
      <div className='flex w-full md:w-1/2 justify-center items-center bg-white'>
        <div className='w-full max-w-md p-10'>
          <h3 className='text-[#4A4B4D] text-3xl font-bold mb-6 text-center'>Đăng nhập</h3>

          <form onSubmit={formik.handleSubmit} className='space-y-5'>
            {/* Email */}
            <div>
              <div
                className={`flex items-center h-14 bg-[#f5f5f5] rounded-xl px-4 border transition-all duration-200 focus-within:border-[#fc6011] ${
                  formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-300"
                }`}
              >
                <Image src='/assets/email.png' alt='email' width={20} height={20} className='mr-3' />
                <input
                  type='email'
                  name='email'
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder='Nhập email của bạn'
                  className='bg-transparent w-full outline-none text-gray-700 placeholder-gray-400'
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className='text-red-500 text-sm mt-1 ml-1'>{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div
                className={`flex items-center h-14 bg-[#f5f5f5] rounded-xl px-4 border transition-all duration-200 focus-within:border-[#fc6011] ${
                  formik.touched.password && formik.errors.password ? "border-red-500" : "border-gray-300"
                }`}
              >
                <Image src='/assets/lock.png' alt='lock' width={20} height={20} className='mr-3' />
                <input
                  type={showPass ? "text" : "password"}
                  name='password'
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder='Nhập mật khẩu của bạn'
                  className='bg-transparent w-full outline-none text-gray-700 placeholder-gray-400'
                />
                <Image
                  src={showPass ? "/assets/eye_show.png" : "/assets/eye_hide.png"}
                  alt='toggle visibility'
                  width={20}
                  height={20}
                  className='ml-3 cursor-pointer'
                  onClick={() => setShowPass(!showPass)}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className='text-red-500 text-sm mt-1 ml-1'>{formik.errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className={`w-full h-14 rounded-xl text-white font-semibold transition-all duration-200 shadow-md ${
                formik.isValid && formik.dirty
                  ? "bg-gradient-to-r from-[#fc6011] to-[#ff7b00] hover:from-[#e45700] hover:to-[#fc6011] cursor-pointer"
                  : "bg-[#f5854d] cursor-not-allowed"
              }`}
            >
              Đăng nhập
            </button>

            {/* Register link */}
            <p className='text-center mt-4 text-gray-600'>
              <a href='/auth/register' className='hover:underline font-medium text-[#4A4B4D]'>
                Đăng ký cửa hàng
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
