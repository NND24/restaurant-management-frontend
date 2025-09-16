"use client";
import FloatingButton from "@/components/fragment/FloatingButton";
import Header from "@/components/Header";
import StaffModel from "@/components/popups/Staff";
import {
  createStaff,
  deleteStaff,
  getAllStaff,
  getStaff,
  updateStaff,
} from "@/service/staff";
import localStorageService from "@/utils/localStorageService";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const page = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [storeId, setStoreId] = useState(localStorageService.getStoreId());
  const [staffBeingEdited, setStaffBeingEdited] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  // handel pagination, search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStaff = async () => {
    const res = await getAllStaff(storeId, {
      page,
      limit: 5,
      search: searchTerm,
      role: filterRole,
    });

    if (res.success === true) {
      setStaff(res.data.employees);
      setTotalPages(res.data.totalPages || 1);
    } else {
      console.error("Lỗi khi lấy nhân viên:", res.message);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [storeId, page, searchTerm, filterRole]);

  const handleAddStaff = async (data) => {
    try {
      const res = await createStaff({ storeId, staffData: data });
      console.log(res);

      if (res && res.success === true) {
        await fetchStaff();
        setShowForm(false);
        toast.success("Thêm nhân viên thành công");
      } else {
        toast.error(res.message || "Lỗi khi tạo nhân viên");
      }
    } catch (err) {
      toast.error("Lỗi khi tạo nhân viên");
    }
  };

  const handleEditStaff = async (staff) => {
    try {
      const res = await getStaff({ staffId: staff._id });
      if (res.success === true) {
        setStaffBeingEdited(res.data); // lấy thông tin chi tiết mới nhất
        setViewOnly(false); // đảm bảo là editable
        setShowForm(true);
      } else {
        console.error("Không lấy được thông tin nhân viên:", res.message);
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết nhân viên để sửa:", err);
    }
  };

  const handleUpdateStaff = async (data) => {
    try {
      const res = await updateStaff({
        userId: staffBeingEdited._id,
        staffData: data,
      });

      if (res && res.success === true) {
        await fetchStaff();
        setShowForm(false);
        setStaffBeingEdited(null);
        toast.success("Cập nhật nhân viên thành công");
      } else {
        toast.error(res.message || "Lỗi khi tạo nhân viên");
      }
    } catch (err) {
      alert(err.message || "Lỗi khi cập nhật nhân viên");
    }
  };

  const handleViewStaff = async (staff) => {
    try {
      const res = await getStaff({ staffId: staff._id });
      if (res.success === true) {
        setStaffBeingEdited(res.data);
        setShowForm(true);
        setViewOnly(true);
      } else {
        console.log("Không lấy được thông tin nhân viên: ", res.message);
        toast.error("Không lấy được thông tin nhân viên");
      }
    } catch (error) {
      console.log("Lỗi khi lấy chi tiết nhân viên: ", error);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Nhân viên này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteStaff({ storeId, userId: staffId }); // ✅ truyền object

        Swal.fire("Đã xóa!", "Nhân viên đã được xóa.", "success");

        const res = await getAllStaff(storeId);
        console.log("Res xóa: ", res.success);
        if (res.success === true) {
          await fetchStaff();
        }
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa nhân viên thất bại", "error");
      }
    }
  };

  return (
    <>
      <Header title="Quản lý nhân viên" goBack={true} />
      <FloatingButton onClick={() => setShowForm(true)} />
      <div className="pt-[70px] pb-[10px] bg-gray-100">
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-white">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="border px-4 py-2 rounded-md w-full sm:w-1/3"
          />

          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
            className="border px-4 py-2 rounded-md w-full sm:w-1/4 mt-2 sm:mt-0"
          >
            <option value="">Tất cả vai trò</option>
            <option value="staff">Nhân viên</option>
            <option value="manager">Quản lý</option>
          </select>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Họ và tên
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Chức vụ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-800">
              {staff.map((st) => (
                <tr key={st._id}>
                  <td
                    onClick={() => handleViewStaff(st)}
                    className="px-6 py-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar.url || "/default-avatar.png"}
                        alt={st.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{st.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {st.role.includes("staff")
                      ? "Nhân viên"
                      : st.role.includes("manager")
                      ? "Quản lý"
                      : st.role.includes("owner")
                      ? "Chủ nhà hàng"
                      : "Không xác định"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-8">
                      <button
                        onClick={() => handleEditStaff(st)}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(st._id)}
                        className="text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span>
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
      {showForm && (
        <StaffModel
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setStaffBeingEdited(null);
            setViewOnly(false);
          }}
          onSubmit={staffBeingEdited ? handleUpdateStaff : handleAddStaff}
          initialData={staffBeingEdited}
          isUpdate={!!staffBeingEdited}
          readOnly={viewOnly}
        />
      )}
    </>
  );
};

export default page;
