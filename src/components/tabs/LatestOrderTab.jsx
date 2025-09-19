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

const LatestOrder = ({ storeId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { sendNotification } = useSocket();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders({
        storeId,
        status: "pending",
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

  const handleConfirm = async (order) => {
    try {
      const updatedOrder = { ...order, status: "confirmed" };
      sendNotification({
        userId: order.userId,
        title: "Cập nhật trạng thái đơn hàng",
        message: `Đơn hàng #${order._id} đã được xác nhận.`,
        orderId: order._id,
        type: "info",
      });
      await updateOrder({ orderId: order._id, updatedData: updatedOrder });
      fetchOrders();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

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
    {
      field: "action",
      headerName: "Hành động",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant='contained'
          sx={{
            backgroundColor: "#fc6011",
          }}
          size='small'
          onClick={() => handleConfirm(params.row)}
        >
          Xác nhận
        </Button>
      ),
    },
  ];

  return (
    <div style={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={orders}
        columns={columns}
        getRowId={(row) => row._id}
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        loading={loading}
        localeText={viVN}
      />
    </div>
  );
};

export default LatestOrder;
