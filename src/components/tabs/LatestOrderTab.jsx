"use client";
import React, { useCallback, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getAllOrders, updateOrder } from "@/service/order";
import { useSocket } from "@/context/SocketContext";
import { viVN } from "@/utils/constants";
import { Button } from "@mui/material";
import generateOrderNumber from "../../utils/generateOrderNumber";
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

const LatestOrder = ({ storeId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetailOrder, setOpenDetailOrder] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { sendNotification } = useSocket();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrders({
        storeId,
        status: ["pending"],
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      flex: 2,
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
    { field: "total", headerName: "Tổng tiền", width: 100, headerAlign: "center", align: "center" },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{new Date(params.value).toLocaleString("vi-VN") || ""}</span>,
    },
    { field: "status", headerName: "Trạng thái", width: 100, headerAlign: "center", align: "center" },
    {
      field: "action",
      headerName: "Hành động",
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
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
        loading={loading}
        disableRowSelectionOnClick
        localeText={viVN}
      />
    </div>
  );
};

export default LatestOrder;
