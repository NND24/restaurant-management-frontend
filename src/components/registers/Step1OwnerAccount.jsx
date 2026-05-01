import { checkOwnerInfo } from "@/service/register";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Step1OwnerAccount = ({ formData, setFormData, nextStep }) => {
  const { t } = useTranslation();
  const [localOwner, setLocalOwner] = useState(formData.owner);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setLocalOwner(formData.owner);
  }, [formData.owner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalOwner((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    const { name, email, phonenumber, gender, password, confirmPassword } = localOwner;

    if (!name.trim()) return toast.error(t("auth.name_required"));
    if (!email.includes("@")) return toast.error(t("auth.email_invalid"));
    if (!/^\d{9,11}$/.test(phonenumber)) return toast.error(t("auth.phone_invalid"));
    if (!password || password.length < 6) return toast.error(t("auth.password_min"));
    if (password !== confirmPassword) return toast.error(t("auth.password_mismatch"));
    if (!gender) return toast.error(t("auth.gender_required"));

    const res = await checkOwnerInfo(localOwner);
    if (res.status !== "success") {
      toast.error(res.message || t("auth.check_error"));
      return;
    }

    setFormData((prev) => ({ ...prev, owner: localOwner }));
    nextStep();
  };

  return (
    <div className='w-full max-w-4xl mx-auto rounded-3xl bg-white shadow-xl p-8 md:p-12'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        {/* Full name */}
        <div>
          <label className='block font-semibold text-gray-700 mb-1'>{t("auth.owner_name")}</label>
          <div className='relative flex items-center rounded-lg px-3 py-2 border bg-[#f5f5f5] border-gray-300'>
            <FaUser className='text-gray-400' />
            <input
              type='text'
              name='name'
              value={localOwner.name}
              onChange={handleChange}
              placeholder={t("auth.owner_name_placeholder")}
              className='ml-3 w-full pr-10 bg-transparent outline-none text-gray-700 placeholder-gray-400 rounded-lg'
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className='block font-semibold text-gray-700 mb-1'>{t("auth.email")}</label>
          <div className='relative flex items-center rounded-lg px-3 py-2 border bg-[#f5f5f5] border-gray-300'>
            <FaEnvelope className='text-gray-400' />
            <input
              type='email'
              name='email'
              value={localOwner.email}
              onChange={handleChange}
              placeholder='example@gmail.com'
              className='ml-3 w-full pr-10 bg-transparent outline-none text-gray-700 placeholder-gray-400 rounded-lg'
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className='block font-semibold text-gray-700 mb-1'>{t("auth.owner_phone")}</label>
          <div className='relative flex items-center rounded-lg px-3 py-2 border bg-[#f5f5f5] border-gray-300'>
            <FaPhone className='text-gray-400' />
            <input
              type='text'
              name='phonenumber'
              value={localOwner.phonenumber}
              onChange={handleChange}
              placeholder={t("auth.owner_phone_placeholder")}
              className='ml-3 w-full pr-10 bg-transparent outline-none text-gray-700 placeholder-gray-400 rounded-lg'
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className='block font-semibold text-gray-700 mb-1'>{t("auth.owner_gender")}</label>
          <div className='relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-[#f5f5f5]'>
            <select
              name='gender'
              value={localOwner.gender}
              onChange={handleChange}
              className='w-full bg-transparent outline-none text-gray-700 appearance-none pr-6'
            >
              <option value='male'>{t("auth.gender_male")}</option>
              <option value='female'>{t("auth.gender_female")}</option>
              <option value='other'>{t("auth.gender_other")}</option>
            </select>

            <div className='pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
              </svg>
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className='block font-semibold text-gray-700 mb-1'>{t("auth.password")}</label>
          <div className='relative flex items-center rounded-lg px-3 py-2 border bg-[#f5f5f5] border-gray-300'>
            <FaLock className='text-gray-400' />
            <input
              type={showPassword ? "text" : "password"}
              name='password'
              value={localOwner.password}
              onChange={handleChange}
              placeholder='********'
              className='ml-3 w-full pr-10 bg-transparent outline-none text-gray-700 placeholder-gray-400 rounded-lg'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none'
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label className='block font-semibold text-gray-700 mb-1'>{t("auth.owner_confirm_password")}</label>
          <div className='relative flex items-center rounded-lg px-3 py-2 border bg-[#f5f5f5] border-gray-300'>
            <FaLock className='text-gray-400' />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name='confirmPassword'
              value={localOwner.confirmPassword}
              onChange={handleChange}
              placeholder='********'
              className='ml-3 w-full pr-10 bg-transparent outline-none text-gray-700 placeholder-gray-400 rounded-lg'
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none'
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
      </div>

      <div className='flex justify-between mt-10'>
        <Link
          href='/auth/login'
          className='px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold transition'
        >
          {t("auth.back_to_login")}
        </Link>
        <button
          onClick={handleNext}
          className='px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
        >
          {t("auth.continue")}
        </button>
      </div>
    </div>
  );
};

export default Step1OwnerAccount;
