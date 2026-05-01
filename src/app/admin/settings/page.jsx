"use client";
import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Dropzone from "react-dropzone";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/service/user";
import { changePassword } from "@/service/auth";
import { uploadAvatar } from "@/service/upload";
import Heading from "@/components/Heading";

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phonenumber: user?.phonenumber || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const validateProfile = () => {
    const errs = {};
    if (!profile.name.trim() || profile.name.trim().length < 2) errs.name = t("admin.validation_name_min");
    if (!profile.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = t("admin.validation_email_invalid");
    if (profile.phonenumber && !/^\d{10,11}$/.test(profile.phonenumber)) errs.phonenumber = t("admin.validation_phone");
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwords.oldPassword) errs.oldPassword = t("settings.validation_old_password_required");
    if (!passwords.newPassword || passwords.newPassword.length < 8) errs.newPassword = t("admin.validation_password_min");
    const pwChecks = [/[A-Z]/, /[a-z]/, /[0-9]/];
    if (!pwChecks.every((r) => r.test(passwords.newPassword))) errs.newPassword = t("settings.validation_password_complexity");
    if (passwords.newPassword !== passwords.confirmPassword) errs.confirmPassword = t("settings.validation_password_mismatch");
    return errs;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }
    setSavingProfile(true);
    try {
      await updateUser(profile);
      toast.success(t("settings.profile_update_success"));
      if (user?._id) await fetchUser(user._id);
    } catch (err) {
      toast.error(err?.message || t("settings.profile_update_fail"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return; }
    setSavingPassword(true);
    try {
      await changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
      toast.success(t("settings.password_change_success"));
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.message || t("settings.password_change_fail"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadAvatar(formData);
      toast.success(t("settings.avatar_update_success"));
      if (user?._id) await fetchUser(user._id);
    } catch {
      toast.error(t("settings.avatar_upload_fail"));
    }
  };

  const inputClass = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
      err ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#fc6011]"
    }`;

  const newPw = passwords.newPassword;
  const pwRequirements = [
    { label: t("settings.pw_req_min_length"), met: newPw.length >= 8 },
    { label: t("settings.pw_req_uppercase"), met: /[A-Z]/.test(newPw) },
    { label: t("settings.pw_req_lowercase"), met: /[a-z]/.test(newPw) },
    { label: t("settings.pw_req_number"), met: /[0-9]/.test(newPw) },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <Heading title={t("settings.page_title")} description="" keywords="" />

      {/* Profile section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">{t("settings.personal_info_heading")}</h2>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <Dropzone maxFiles={1} accept={{ "image/*": [] }} onDrop={handleAvatarDrop}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="relative cursor-pointer group">
                <input {...getInputProps()} />
                <div className="relative w-24 h-24">
                  <Image
                    src={
                      user?.avatar?.url ||
                      "https://res.cloudinary.com/datnguyen240/image/upload/v1722168751/avatars/avatar_pnncdk.png"
                    }
                    alt="avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{t("settings.avatar_change_label")}</span>
                  </div>
                </div>
              </div>
            )}
          </Dropzone>
          <p className="text-xs text-gray-400 mt-2">{t("settings.avatar_click_hint")}</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.field_full_name")}</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder={t("admin.placeholder_name")}
              className={inputClass(profileErrors.name)}
            />
            {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.field_email")}</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              placeholder={t("admin.placeholder_email")}
              className={inputClass(profileErrors.email)}
            />
            {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.field_phone")}</label>
            <input
              type="text"
              value={profile.phonenumber}
              onChange={(e) => setProfile((p) => ({ ...p, phonenumber: e.target.value }))}
              placeholder={t("admin.placeholder_phone")}
              className={inputClass(profileErrors.phonenumber)}
            />
            {profileErrors.phonenumber && <p className="text-red-500 text-xs mt-1">{profileErrors.phonenumber}</p>}
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full py-2.5 rounded-xl bg-[#fc6011] text-white font-semibold text-sm hover:bg-[#e55010] transition disabled:opacity-60"
          >
            {savingProfile ? t("common.saving") : t("settings.save_profile_btn")}
          </button>
        </form>
      </div>

      {/* Password section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">{t("settings.change_password_heading")}</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("settings.field_old_password")}</label>
            <input
              type="password"
              value={passwords.oldPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, oldPassword: e.target.value }))}
              placeholder={t("settings.placeholder_old_password")}
              className={inputClass(passwordErrors.oldPassword)}
            />
            {passwordErrors.oldPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.oldPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("settings.field_new_password")}</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder={t("settings.placeholder_new_password")}
              className={inputClass(passwordErrors.newPassword)}
            />
            {newPw && (
              <div className="mt-2 space-y-1">
                {pwRequirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${req.met ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                      {req.met ? "✓" : "·"}
                    </span>
                    <span className={`text-xs ${req.met ? "text-green-600" : "text-gray-400"}`}>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
            {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("settings.field_confirm_password")}</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              placeholder={t("settings.placeholder_confirm_password")}
              className={inputClass(passwordErrors.confirmPassword)}
            />
            {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full py-2.5 rounded-xl bg-gray-800 text-white font-semibold text-sm hover:bg-gray-700 transition disabled:opacity-60"
          >
            {savingPassword ? t("settings.changing_password_btn") : t("settings.change_password_btn")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
