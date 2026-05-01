"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Dropzone from "react-dropzone";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import { uploadAvatar } from "@/service/upload";
import { updateUser } from "@/service/user";
import { useAuth } from "@/context/AuthContext";
import Heading from "@/components/Heading";

const page = () => {
  const { t } = useTranslation();
  const [avatarFile, setAvatarFile] = useState(null);

  const { user, fetchUser } = useAuth();

  const handleUploadAvatar = async () => {
    if (avatarFile) {
      try {
        const formData = new FormData();
        for (let i = 0; i < avatarFile?.length; i++) {
          formData.append("file", avatarFile[i]);
        }
        await uploadAvatar(formData);
        setAvatarFile(null);

        await fetchUser(user?._id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (avatarFile) {
      handleUploadAvatar();
    }
  }, [avatarFile]);

  const schema = yup.object().shape({
    name: yup.string().required(t("profile.validation_name_required")),
    email: yup.string().email(t("profile.validation_email_invalid")).required(t("profile.validation_email_required")),
    phonenumber: yup.string().required(t("profile.validation_phone_required")),
    gender: yup.string().required(t("profile.validation_gender_required")),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      phonenumber: user?.phonenumber || "",
      gender: user?.gender || "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await updateUser(values);
        toast.success(t("profile.update_success"));
        await fetchUser(user?._id);
      } catch (error) {
        console.error(error);
      }
    },
    enableReinitialize: true,
  });

  return (
    <div className='overflow-y-scroll h-full pt-[30px] pb-[100px] px-[20px] md:px-0 bg-[#fff] md:bg-[#f9f9f9]'>
      <Heading title={t("profile.title")} description='' keywords='' />
      <div className='bg-[#fff] lg:w-[60%] md:w-[80%] md:mx-auto md:border md:border-[#a3a3a3a3] md:border-solid md:rounded-[10px] md:shadow-[rgba(0,0,0,0.24)_0px_3px_8px] md:overflow-hidden md:p-[20px]'>
        <div className='flex flex-col items-center mt-[20px]'>
          <div className='relative w-[110px] pt-[110px] mt-[20px] '>
            <Image
              src={
                user?.avatar?.url ||
                "https://res.cloudinary.com/datnguyen240/image/upload/v1722168751/avatars/avatar_pnncdk.png"
              }
              alt=''
              layout='fill'
              objectFit='fill'
              className='object-cover rounded-full'
            />
            <Dropzone
              maxFiles={1}
              accept={{ "image/*": [] }}
              onDrop={(acceptedFiles) =>
                setAvatarFile(
                  acceptedFiles.map((file) =>
                    Object.assign(file, {
                      preview: URL.createObjectURL(file),
                    })
                  )
                )
              }
            >
              {({ getRootProps, getInputProps }) => (
                <section className='w-full'>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Image
                      src='/assets/camera.png'
                      alt=''
                      width={40}
                      height={40}
                      className='absolute bottom-[-4px] right-[-4px] object-contain z-10 p-[6px] rounded-full bg-[#f5f5f5] shadow-[rgba(0,0,0,0.24)_0px_3px_8px]'
                    />
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
          <div className='py-[10px]'>
            <span className='text-[#fc6011] text-[14px] font-bold'>{t("common.edit")} {t("profile.info_label")}</span>
          </div>
          <h3 className='text-[#4A4B4D] text-[26px] font-bold pb-[10px] text-center'>{t("profile.greeting")} {user?.name}</h3>
        </div>

        <form onSubmit={formik.handleSubmit} className='flex flex-col gap-[20px] md:gap-[10px]'>
          <div className='relative flex items-center bg-[#f5f5f5] text-[#636464] w-full rounded-[12px] gap-[8px] overflow-hidden'>
            <span className='absolute top-[12px] left-[20px] text-[13px] md:text-[11px]'>{t("profile.label_name")}</span>
            <input
              type='text'
              name='name'
              onChange={formik.handleChange("name")}
              onBlur={formik.handleBlur("name")}
              placeholder={t("profile.placeholder_name")}
              className='bg-[#f5f5f5] text-[18px] w-full px-[20px] pt-[28px] pb-[12px]'
              value={formik.values.name}
            />
          </div>
          {formik.touched.name && formik.errors.name ? (
            <div className='text-red-500 text-sm'>{formik.errors.name}</div>
          ) : null}

          <div className='relative flex items-center bg-[#f5f5f5] text-[#636464] w-full rounded-[12px] gap-[8px] overflow-hidden'>
            <span className='absolute top-[12px] left-[20px] text-[13px] md:text-[11px]'>Email</span>
            <input
              type='email'
              name='email'
              placeholder={t("profile.placeholder_email")}
              value={formik.values.email}
              className='bg-[#f5f5f5] text-[18px] w-full px-[20px] pt-[28px] pb-[12px]'
            />
          </div>

          <div className='relative flex items-center bg-[#f5f5f5] text-[#636464] w-full rounded-[12px] gap-[8px] overflow-hidden'>
            <span className='absolute top-[12px] left-[20px] text-[13px] md:text-[11px]'>{t("profile.label_phone")}</span>
            <input
              type='text'
              name='phonenumber'
              onChange={formik.handleChange("phonenumber")}
              onBlur={formik.handleBlur("phonenumber")}
              placeholder={t("profile.placeholder_phone")}
              value={formik.values.phonenumber}
              className='bg-[#f5f5f5] text-[18px] w-full px-[20px] pt-[28px] pb-[12px]'
            />
          </div>
          {formik.touched.phonenumber && formik.errors.phonenumber ? (
            <div className='text-red-500 text-sm'>{formik.errors.phonenumber}</div>
          ) : null}

          <div className='w-full my-[10px] flex gap-[2px] flex-col justify-between'>
            <div className='flex gap-[10px] flex-row'>
              <label
                className={`flex items-center justify-between flex-1 p-[12px] rounded-[6px] border border-solid text-subColor ${
                  formik.touched.gender && formik.errors.gender !== undefined ? "border-red-500" : "border-[#7a7a7a]"
                }`}
                htmlFor='female'
              >
                {t("profile.gender_female")}
                <input
                  type='radio'
                  name='gender'
                  id='female'
                  value='female'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.gender === "female"}
                />
              </label>

              <label
                className={`flex items-center justify-between flex-1 p-[12px] rounded-[6px] border border-solid border-borderColor text-subColor ${
                  formik.touched.gender && formik.errors.gender !== undefined ? "border-red-500" : "border-[#7a7a7a]"
                }`}
                htmlFor='male'
                onChange={formik.handleChange("gender")}
                onBlur={formik.handleBlur("gender")}
              >
                {t("profile.gender_male")}
                <input
                  type='radio'
                  name='gender'
                  id='male'
                  value='male'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.gender === "male"}
                />
              </label>

              <label
                className={`flex items-center justify-between flex-1 p-[12px] rounded-[6px] border border-solid border-borderColor text-subColor ${
                  formik.touched.gender && formik.errors.gender !== undefined ? "border-red-500" : "border-[#7a7a7a]"
                }`}
                htmlFor='other'
                onChange={formik.handleChange("gender")}
                onBlur={formik.handleBlur("gender")}
              >
                {t("profile.gender_other")}
                <input
                  type='radio'
                  name='gender'
                  id='other'
                  value='other'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.gender === "other"}
                />
              </label>
            </div>
            {formik.touched.gender && formik.errors.gender ? (
              <div className='text-red-500 text-sm'>{formik.errors.gender}</div>
            ) : null}
          </div>

          <button
            type='submit'
            className={`text-center text-[#fff] font-semibold w-full p-[20px] rounded-full my-[10px] shadow-md hover:shadow-lg ${
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
