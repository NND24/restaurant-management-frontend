"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getAllOrders } from "@/service/order";
import generateOrderNumber from "../../utils/generateOrderNumber";
import { ThreeDots } from "react-loader-spinner";
import { viVN } from "@/utils/constants";

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
};

const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

export default function HistoryOrderDataGrid({ storeId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders({
        storeId,
        status: ["completed", "delivered", "done", "cancelled", "taken"],
        limit: 1000, // lấy hết đơn để DataGrid pagination tự xử lý
        page: 1,
      });
      setOrders(res?.data ?? []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) fetchOrders();
  }, [storeId]);

  const rows = orders.map((order, index) => {
    const totalQuantity = order.items?.reduce((acc, item) => acc + item.quantity, 0);
    return {
      id: order._id,
      orderNumber: generateOrderNumber(order._id),
      customer: order.user?.name || "Unknown",
      totalQuantity,
      totalPrice: Number(order.finalTotal) || 0,
      status: statusTypes[order.status] ?? "n/a",
      payment: paymentTypes[order.paymentMethod] ?? "Thanh toán khi nhận hàng",
      createdAt: new Date(order.createdAt).toLocaleString(),
    };
  });

  const columns = [
    { field: "orderNumber", headerName: "Mã đơn", width: 130 },
    { field: "customer", headerName: "Khách hàng", width: 180 },
    { field: "totalQuantity", headerName: "Số món", width: 100, type: "number" },
    {
      field: "totalPrice",
      headerName: "Tổng tiền",
      width: 150,
      valueFormatter: (params) => formatVND(params.value),
    },
    { field: "status", headerName: "Trạng thái", width: 150 },
    { field: "payment", headerName: "Thanh toán", width: 200 },
    { field: "createdAt", headerName: "Thời gian", width: 180 },
  ];

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      {loading ? (
        <div className='flex justify-center items-center h-full w-full'>
          <ThreeDots visible={true} height='80' width='80' color='#fc6011' radius='9' />
        </div>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          pagination
          autoHeight
          disableSelectionOnClick
          components={{ Toolbar: GridToolbar }}
          loading={loading}
          localeText={viVN}
        />
      )}
    </div>
  );
}
