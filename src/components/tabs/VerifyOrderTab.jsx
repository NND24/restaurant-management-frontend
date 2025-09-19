"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllOrders, updateOrder } from "@/service/order";
import localStorageService from "@/utils/localStorageService";
import generateOrderNumber from "../../utils/generateOrderNumber";
import { Button } from "@mui/material";
import { useSocket } from "@/context/SocketContext";
import { viVN } from "@/utils/constants";

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

const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

export default function VerifyOrderTab({ storeId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendNotification } = useSocket();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllOrders({
        storeId,
        status: ["confirmed", "finished"],
        limit: 50, // lấy nhiều để DataGrid tự paginate
        page: 1,
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateOrder = async (order, status) => {
    try {
      await updateOrder({
        orderId: order._id,
        updatedData: { ...order, status },
      });
      sendNotification({
        userId: order.userId,
        title: "Cập nhật trạng thái đơn hàng",
        message: `Đơn hàng #${order._id} → ${statusTypes[status]}`,
        orderId: order._id,
        type: "info",
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const rows = orders.map((o, idx) => ({
    id: o._id,
    stt: idx + 1,
    orderNo: `#${generateOrderNumber(o._id)}`,
    customer: o.user?.name || o.shipInfo?.contactName || "Khách lạ",
    phone: o.shipInfo?.contactPhonenumber,
    address: o.shipInfo?.address,
    quantity: o.items?.reduce((sum, i) => sum + (i.quantity || 0), 0),
    total: formatVND(o.finalTotal),
    createdAt: new Date(o.createdAt).toLocaleString("vi-VN"),
    status: statusTypes[o.status] || o.status,
    raw: o,
  }));

  const columns = [
    { field: "stt", headerName: "STT", width: 70 },
    { field: "orderNo", headerName: "Mã đơn", width: 120 },
    { field: "customer", headerName: "Khách hàng", width: 150 },
    { field: "phone", headerName: "SĐT", width: 120 },
    { field: "address", headerName: "Địa chỉ", flex: 1 },
    { field: "quantity", headerName: "Số món", width: 100 },
    { field: "total", headerName: "Tổng tiền", width: 130 },
    { field: "createdAt", headerName: "Ngày tạo", width: 180 },
    { field: "status", headerName: "Trạng thái", width: 160 },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const order = params.row.raw;
        if (order.status === "finished") {
          return (
            <Button variant='contained' color='warning' size='small' onClick={() => handleUpdateOrder(order, "taken")}>
              Giao tài xế
            </Button>
          );
        }
        return (
          <Button variant='contained' color='primary' size='small' onClick={() => handleUpdateOrder(order, "finished")}>
            Thông báo tài xế
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        localeText={viVN}
      />
    </div>
  );
}
