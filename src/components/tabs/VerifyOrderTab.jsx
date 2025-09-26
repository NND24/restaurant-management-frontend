"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllOrders, updateOrder } from "@/service/order";
import generateOrderNumber from "../../utils/generateOrderNumber";
import { Button } from "@mui/material";
import { useSocket } from "@/context/SocketContext";
import { viVN } from "@/utils/constants";
import OrderDetailModal from "../orders/OrderDetailModal";

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

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDetailOrder, setOpenDetailOrder] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { sendNotification } = useSocket();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllOrders({
        storeId,
        status: ["confirmed", "finished"],
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
    orderNo: `#${generateOrderNumber(o._id)}`,
    customer: o.user?.name || o.shipInfo?.contactName || "Khách lạ",
    quantity: o.items?.reduce((sum, i) => sum + (i.quantity || 0), 0),
    someItems: o.items,
    total: formatVND(o.finalTotal),
    createdAt: o.createdAt,
    status: statusTypes[o.status] || o.status,
    raw: o,
  }));

  const columns = [
    { field: "orderNo", headerName: "Mã đơn", width: 80, headerAlign: "center", align: "center" },
    { field: "customer", headerName: "Khách hàng", width: 150, headerAlign: "center" },
    { field: "quantity", headerName: "Số món", width: 80, headerAlign: "center", align: "center" },
    {
      field: "someItems",
      headerName: "Món ăn được đặt",
      flex: 1,
      headerAlign: "center",
      align: "left",
      renderCell: (params) => {
        const items = params.row.someItems || [];
        const preview = items
          .slice(0, 2)
          .map((i) => i.dishName || i.dish?.name)
          .join(", ");
        const more = items.length > 2 ? ` +${items.length - 2} món khác` : "";
        return (
          <span>
            {preview}
            {more}
          </span>
        );
      },
    },
    { field: "total", headerName: "Tổng tiền", width: 130, headerAlign: "center", align: "center" },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{new Date(params.value).toLocaleString("vi-VN") || ""}</span>,
    },
    { field: "status", headerName: "Trạng thái", width: 160, headerAlign: "center" },
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
    <div style={{ height: 525, width: "100%" }}>
      {openDetailOrder && (
        <OrderDetailModal
          open={openDetailOrder}
          onClose={() => {
            setOpenDetailOrder(false);
            fetchOrders();
          }}
          orderId={selectedId}
        />
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        onRowClick={(params) => {
          setSelectedId(params.row.id);
          setOpenDetailOrder(true);
        }}
        pagination
        pageSizeOptions={[]}
        initialState={{
          pagination: { paginationModel: { pageSize: 8 } },
        }}
        loading={isLoading}
        disableRowSelectionOnClick
        localeText={viVN}
      />
    </div>
  );
}
