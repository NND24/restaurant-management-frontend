"use client";
import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Dropzone from "react-dropzone";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/service/user";
import { changePassword } from "@/service/auth";
import { uploadAvatar } from "@/service/upload";
import Heading from "@/components/Heading";

const AdminSettingsPage = () => {
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
    if (!profile.name.trim() || profile.name.trim().length < 2) errs.name = "Tên ít nhất 2 ký tự";
    if (!profile.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = "Email không hợp lệ";
    if (profile.phonenumber && !/^\d{10,11}$/.test(profile.phonenumber)) errs.phonenumber = "Số điện thoại 10-11 chữ số";
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwords.oldPassword) errs.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!passwords.newPassword || passwords.newPassword.length < 8) errs.newPassword = "Mật khẩu ít nhất 8 ký tự";
    const pwChecks = [/[A-Z]/, /[a-z]/, /[0-9]/];
    if (!pwChecks.every((r) => r.test(passwords.newPassword))) errs.newPassword = "Cần có chữ hoa, chữ thường và số";
    if (passwords.newPassword !== passwords.confirmPassword) errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    return errs;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }
    setSavingProfile(true);
    try {
      await updateUser(profile);
      toast.success("Cập nhật thông tin thành công!");
      if (user?._id) await fetchUser(user._id);
    } catch (err) {
      toast.error(err?.message || "Cập nhật thất bại!");
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
      toast.success("Đổi mật khẩu thành công!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.message || "Đổi mật khẩu thất bại!");
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
      toast.success("Cập nhật ảnh đại diện thành công!");
      if (user?._id) await fetchUser(user._id);
    } catch {
      toast.error("Tải ảnh thất bại!");
    }
  };

  const inputClass = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
      err ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#fc6011]"
    }`;

  const newPw = passwords.newPassword;
  const pwRequirements = [
    { label: "Ít nhất 8 ký tự", met: newPw.length >= 8 },
    { label: "Có chữ hoa (A-Z)", met: /[A-Z]/.test(newPw) },
    { label: "Có chữ thường (a-z)", met: /[a-z]/.test(newPw) },
    { label: "Có chữ số (0-9)", met: /[0-9]/.test(newPw) },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <Heading title="Cài đặt tài khoản" description="" keywords="" />

      {/* Profile section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Thông tin cá nhân</h2>

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
                    <span className="text-white text-xs font-medium">Thay đổi</span>
                  </div>
                </div>
              </div>
            )}
          </Dropzone>
          <p className="text-xs text-gray-400 mt-2">Click vào ảnh để thay đổi</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nhập tên..."
              className={inputClass(profileErrors.name)}
            />
            {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              placeholder="Nhập email..."
              className={inputClass(profileErrors.email)}
            />
            {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input
              type="text"
              value={profile.phonenumber}
              onChange={(e) => setProfile((p) => ({ ...p, phonenumber: e.target.value }))}
              placeholder="Nhập số điện thoại..."
              className={inputClass(profileErrors.phonenumber)}
            />
            {profileErrors.phonenumber && <p className="text-red-500 text-xs mt-1">{profileErrors.phonenumber}</p>}
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full py-2.5 rounded-xl bg-[#fc6011] text-white font-semibold text-sm hover:bg-[#e55010] transition disabled:opacity-60"
          >
            {savingProfile ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </form>
      </div>

      {/* Password section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Đổi mật khẩu</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={passwords.oldPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, oldPassword: e.target.value }))}
              placeholder="Nhập mật khẩu hiện tại..."
              className={inputClass(passwordErrors.oldPassword)}
            />
            {passwordErrors.oldPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.oldPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder="Nhập mật khẩu mới..."
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="Nhập lại mật khẩu mới..."
              className={inputClass(passwordErrors.confirmPassword)}
            />
            {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full py-2.5 rounded-xl bg-gray-800 text-white font-semibold text-sm hover:bg-gray-700 transition disabled:opacity-60"
          >
            {savingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
