"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Swal from "sweetalert2";
import Heading from "@/components/Heading";
import { logoutUser } from "@/service/auth";
import { useAuth } from "@/context/AuthContext";

const page = () => {
  const { user, setUser, setUserId } = useAuth();

  const confirmLogout = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await logoutUser();
        setUserId(null);
        setUser(null);
      } catch (error) {
        console.error(error);
      } finally {
        router.push("/auth/login");
      }
    }
  };

  return (
    <div className='pt-[30px] pb-[100px] md:pt-[75px] md:mt-[20px] md:px-0 bg-[#fff] md:bg-[#f9f9f9]'>
      <div className='bg-[#fff] lg:w-[75%] px-[20px] md:w-[80%] pb-[20px] mb-[20px] md:mx-auto md:border md:border-[#a3a3a3a3] md:border-solid md:rounded-[10px] md:shadow-[rgba(0,0,0,0.24)_0px_3px_8px] md:overflow-hidden'>
        <Link href='/account/profile' className='flex gap-[15px] my-[20px] cursor-pointer'>
          <div className='relative w-[60px] pt-[60px]'>
            <Image
              src={
                user?.avatar?.url ||
                "https://res.cloudinary.com/datnguyen240/image/upload/v1722168751/avatars/avatar_pnncdk.png"
              }
              alt=''
              layout='fill'
              objectFit='cover'
              className='rounded-[6px]'
            />
          </div>
          <div className='flex flex-1 justify-between items-center'>
            <div className=''>
              <p className='text-[#4A4B4D] text-[22px] font-semibold'>{user?.name}</p>
              <p className='text-[#636464] text-[16px]'>{user?.phonenumber}</p>
            </div>

            <div className='relative w-[30px] pt-[30px]'>
              <Image src='/assets/pencil.png' alt='' layout='fill' objectFit='contain' />
            </div>
          </div>
        </Link>

        <Link
          href='/account/change-password'
          className='bg-[#fff] flex items-center justify-between border-b-[1px] border-t-[0px] border-x-[0px] border-b-[#a3a3a3] border-solid px-[8px] py-[12px] my-[20px]'
        >
          <div className='flex items-center gap-[10px]'>
            <div className='relative w-[30px] pt-[30px] md:w-[25px] md:pt-[25px]'>
              <Image src='/assets/lock.png' alt='' layout='fill' objectFit='contain' />
            </div>
            <span className='text-[#4A4B4D] text-[20px] font-semibold'>Đổi mật khẩu</span>
          </div>
          <div className='relative w-[25px] pt-[25px] md:w-[20px] md:pt-[20px]'>
            <Image src='/assets/arrow_right.png' alt='' layout='fill' objectFit='contain' />
          </div>
        </Link>

        <button
          onClick={confirmLogout}
          className='bg-[#fc6011] text-[#fff] font-semibold w-full p-[20px] rounded-full my-[10px] cursor-pointer shadow-md hover:shadow-lg'
        >
          Đăng Xuất
        </button>
      </div>
    </div>
  );
};

export default page;
