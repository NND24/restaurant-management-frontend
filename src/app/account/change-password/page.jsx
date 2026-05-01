"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import { changePassword } from "@/service/auth";
import Heading from "@/components/Heading";

const page = () => {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);

  const schema = yup.object().shape({
    oldPassword: yup.string().required(t("change_password.validation_old_required")),
    newPassword: yup
      .string()
      .min(6, t("change_password.validation_new_min"))
      .required(t("change_password.validation_new_required")),
    confirmPassword: yup
      .string()
      .min(6, t("change_password.validation_confirm_min"))
      .oneOf([yup.ref("newPassword"), null], t("change_password.validation_confirm_mismatch"))
      .required(t("change_password.validation_confirm_required")),
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await changePassword(values);
        toast.success(t("change_password.update_success"));
        formik.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <div className='pt-[30px] pb-[100px] px-[20px] md:pt-[75px] md:mt-[20px] md:px-0 bg-[#fff] md:bg-[#f9f9f9]'>
      <Heading title={t("change_password.title")} description='' keywords='' />
      <div className='bg-[#fff] lg:w-[60%] md:w-[80%] md:mx-auto md:border md:border-[#a3a3a3a3] md:border-solid md:rounded-[10px] md:shadow-[rgba(0,0,0,0.24)_0px_3px_8px] md:overflow-hidden md:p-[20px]'>
        <div className='flex flex-col items-center mt-[20px]'>
          <h3 className='text-[#4A4B4D] text-[26px] font-bold pb-[10px] hidden md:block'>{t("change_password.title")}</h3>
        </div>

        <form onSubmit={formik.handleSubmit} className='flex flex-col gap-[20px] md:gap-[10px] bg-transparent'>
          <div className='relative flex items-center bg-[#f5f5f5] text-[#636464] w-full rounded-[12px] gap-[8px] overflow-hidden'>
            <span className='absolute top-[12px] left-[20px] text-[13px] md:text-[11px]'>{t("change_password.label_old_password")}</span>
            <input
              type={showPass ? "text" : "password"}
              value={formik.values.oldPassword}
              onChange={formik.handleChange("oldPassword")}
              onBlur={formik.handleBlur("oldPassword")}
              placeholder={t("change_password.placeholder_old_password")}
              className='bg-[#e8e9e9] text-[18px] w-full px-[20px] pt-[28px] pb-[12px]'
            />
            {showPass ? (
              <Image
                src='/assets/eye_show.png'
                alt=''
                width={25}
                height={25}
                className='absolute top-[50%] right-[25px] translate-y-[-50%]'
                onClick={() => setShowPass(!showPass)}
              />
            ) : (
              <Image
                src='/assets/eye_hide.png'
                alt=''
                width={25}
                height={25}
                className='absolute top-[50%] right-[25px] translate-y-[-50%]'
                onClick={() => setShowPass(!showPass)}
              />
            )}
          </div>
          {formik.touched.oldPassword && formik.errors.oldPassword ? (
            <div className='text-red-500 text-sm mt-[5px] ml-[20px]'>{formik.errors.oldPassword}</div>
          ) : null}

          <div className='relative flex items-center bg-[#f5f5f5] text-[#636464] w-full rounded-[12px] gap-[8px] overflow-hidden'>
            <span className='absolute top-[12px] left-[20px] text-[13px] md:text-[11px]'>{t("change_password.label_new_password")}</span>
            <input
              type={showPass ? "text" : "password"}
              value={formik.values.newPassword}
              onChange={formik.handleChange("newPassword")}
              onBlur={formik.handleBlur("newPassword")}
              placeholder={t("change_password.placeholder_new_password")}
              className='bg-[#e8e9e9] text-[18px] w-full px-[20px] pt-[28px] pb-[12px]'
            />
            {showPass ? (
              <Image
                src='/assets/eye_show.png'
                alt=''
                width={25}
                height={25}
                className='absolute top-[50%] right-[25px] translate-y-[-50%]'
                onClick={() => setShowPass(!showPass)}
              />
            ) : (
              <Image
                src='/assets/eye_hide.png'
                alt=''
                width={25}
                height={25}
                className='absolute top-[50%] right-[25px] translate-y-[-50%]'
                onClick={() => setShowPass(!showPass)}
              />
            )}
          </div>
          {formik.touched.newPassword && formik.errors.newPassword ? (
            <div className='text-red-500 text-sm mt-[5px] ml-[20px]'>{formik.errors.newPassword}</div>
          ) : null}

          <div className='relative flex items-center bg-[#f5f5f5] text-[#636464] w-full rounded-[12px] gap-[8px] overflow-hidden'>
            <span className='absolute top-[12px] left-[20px] text-[13px] md:text-[11px]'>{t("change_password.label_confirm_password")}</span>
            <input
              type={showPass ? "text" : "password"}
              name='confirmPassword'
              value={formik.values.confirmPassword}
              onChange={formik.handleChange("confirmPassword")}
              onBlur={formik.handleBlur("confirmPassword")}
              placeholder={t("change_password.placeholder_confirm_password")}
              className='bg-[#e8e9e9] text-[18px] w-full px-[20px] pt-[28px] pb-[12px]'
            />
            {showPass ? (
              <Image
                src='/assets/eye_show.png'
                alt=''
                width={25}
                height={25}
                className='absolute top-[50%] right-[25px] translate-y-[-50%]'
                onClick={() => setShowPass(!showPass)}
              />
            ) : (
              <Image
                src='/assets/eye_hide.png'
                alt=''
                width={25}
                height={25}
                className='absolute top-[50%] right-[25px] translate-y-[-50%]'
                onClick={() => setShowPass(!showPass)}
              />
            )}
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <div className='text-red-500 text-sm mt-[5px] ml-[20px]'>{formik.errors.confirmPassword}</div>
          ) : null}

          <button
            type='submit'
            className={`text-center text-[#fff] font-semibold w-full p-[20px] rounded-full my-[10px] shadow-[rgba(0,0,0,0.24)_0px_3px_8px] ${
              formik.isValid && formik.dirty ? "bg-[#fc6011] cursor-pointer" : "bg-[#f5854d] cursor-not-allowed"
            }`}
          >
            {t("common.save")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default page;
