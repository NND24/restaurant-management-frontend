"use client";

import { useState, useEffect } from "react";

import { getCurrentUser, updateUser } from "@/service/user";
import { changePassword } from "@/service/auth";

import Header from "../../components/Header";
import Loading from "../../components/Loading";

import { toast } from "react-toastify";
import Heading from "@/components/Heading";

const ProfilePage = () => {
  const userId = JSON.parse(localStorage.getItem("userId"));
  const userRole = JSON.parse(localStorage.getItem("role")) || [];
  const filteredRole = userRole.find((role) => role !== "user") || "user";
  const roleTranslation = { staff: "Nhân viên", manager: "Quản lý", owner: "Chủ cửa hàng" };
  const displayRole = roleTranslation[filteredRole] || "Không xác định";

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", phonenumber: "" });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await getCurrentUser(userId);
      setUser(userData);
      setFormData({
        name: userData.name || "",
        phonenumber: userData.phonenumber || "",
      });
    } catch (error) {
      console.error("Failed to load user:", error);
      toast.error("Không thể tải thông tin người dùng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateUser(formData);
      setEditMode(false);
      await fetchUserData();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Cập nhật thất bại. Vui lòng thử lại!");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      console.log(result);
      if (result?.status == "Error") {
        toast.error(result.message);
      } else {
        toast.success(result);
      }
    } catch (error) {
      console.error("Password change failed:", error);
      toast.error(error?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại!");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <Header title='Hồ sơ cá nhân' goBack={true} />
      <Heading title='Hồ sơ cá nhân' description='' keywords='' />
      <div className='max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-20'>
        {/* User Information Section */}
        <div className='mb-6'>
          <h2 className='text-2xl font-semibold mb-4 text-gray-800'>Thông tin cá nhân</h2>
          <div className='space-y-4'>
            <div>
              <label className='text-gray-700 font-medium'>Tên</label>
              <input
                type='text'
                name='name'
                value={formData.name}
                disabled={!editMode}
                onChange={handleInputChange}
                className='w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
              />
            </div>
            <div>
              <label className='text-gray-700 font-medium'>Email</label>
              <input
                type='email'
                value={user?.email}
                disabled
                className='w-full px-4 py-2 mt-1 border rounded-lg bg-gray-200 cursor-not-allowed'
              />
            </div>
            <div>
              <label className='text-gray-700 font-medium'>Số điện thoại</label>
              <input
                type='text'
                name='phonenumber'
                value={formData.phonenumber}
                disabled={!editMode}
                onChange={handleInputChange}
                className='w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
              />
            </div>
          </div>
          <div className='flex gap-4 mt-4'>
            <button
              onClick={() => setEditMode(!editMode)}
              className='px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600'
            >
              {editMode ? "Hủy" : "Chỉnh sửa"}
            </button>
            {editMode && (
              <button
                onClick={handleUpdateProfile}
                className='px-6 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-800'
                disabled={isUpdating}
              >
                {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            )}
          </div>
        </div>

        {/* Role Display Section */}
        <div className='mb-6'>
          <h2 className='text-2xl font-semibold mb-4 text-gray-800'>Vai trò</h2>
          <p className='text-gray-700 bg-gray-100 px-4 py-2 rounded-lg'>{displayRole}</p>
        </div>

        {/* Password Reset Section */}
        <div>
          <h2 className='text-2xl font-semibold mb-4 text-gray-800'>Đổi mật khẩu</h2>
          <div className='space-y-4'>
            <input
              type='password'
              name='oldPassword'
              placeholder='Mật khẩu hiện tại'
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
            <input
              type='password'
              name='newPassword'
              placeholder='Mật khẩu mới'
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
            <input
              type='password'
              name='confirmPassword'
              placeholder='Xác nhận mật khẩu mới'
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
          </div>
          <button
            onClick={handlePasswordChange}
            className='mt-4 px-6 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-800'
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
