"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getAllOrders, updateOrder } from "@/service/order";
import { useSocket } from "@/context/SocketContext";
import { viVN } from "@/utils/constants";
import { Button } from "@mui/material";

const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

const paymentTypes = {
  cash: "Thanh toán khi nhận hàng",
  vnpay: "Thanh toán qua VNPay",
};

const statusTypes = {
  pending: "Đang chờ",
  preparing: "Đang chuẩn bị",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
  taken: "Đã lấy",
  delivering: "Đang giao",
  done: "Đã xong",
  finished: "Đã thông báo tài xế",
  confirmed: "Đang chuẩn bị",
};

const HistoryTab = ({ storeId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders({
        storeId,
        status: ["completed", "delivered", "done", "cancelled", "taken"],
        limit: 100,
        page: 1,
      });
      setOrders(res?.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) fetchOrders();
  }, [storeId]);

  const columns = [
    {
      field: "id",
      headerName: "Mã đơn",
      flex: 1,
      valueGetter: (_, row) => row?._id || "--",
    },
    {
      field: "customer",
      headerName: "Khách hàng",
      flex: 1,
      valueGetter: (_, row) => row?.user?.name || "Ẩn danh",
    },
    {
      field: "items",
      headerName: "Số món",
      flex: 0.6,
      valueGetter: (_, row) =>
        Array.isArray(row?.items) ? row.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0,
    },
    {
      field: "finalTotal",
      headerName: "Tổng tiền",
      flex: 1,
      valueGetter: (_, row) => (typeof row?.finalTotal === "number" ? formatVND(row.finalTotal) : "0 ₫"),
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      flex: 1,
      valueGetter: (_, row) => new Date(row.createdAt).toLocaleString("vi-VN"),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      valueGetter: (_, row) => statusTypes[row?.status] || "--",
    },
  ];

  return (
    <div style={{ height: 570, width: "100%" }}>
      <DataGrid
        rows={orders}
        columns={columns}
        getRowId={(row) => row._id}
        pagination
        pageSizeOptions={[]}
        initialState={{
          pagination: { paginationModel: { pageSize: 9 } },
        }}
        loading={loading}
        disableRowSelectionOnClick
        localeText={viVN}
      />
    </div>
  );
};

export default HistoryTab;
