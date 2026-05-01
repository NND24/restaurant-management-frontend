"use client";
import React, { useCallback, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getAllOrders, updateOrder } from "@/service/order";
import { useSocket } from "@/context/SocketContext";
import { viVN } from "@/utils/constants";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import generateOrderNumber from "../../utils/generateOrderNumber";
import OrderDetailModal from "../orders/OrderDetailModal";

const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

const LatestOrder = ({ storeId }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetailOrder, setOpenDetailOrder] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { sendNotification, notifications } = useSocket();

  const statusTypes = {
    pending: t("orders.status_pending"),
    preparing: t("orders.status_confirmed"),
    delivered: t("orders.status_delivered"),
    cancelled: t("orders.status_cancelled"),
    completed: t("orders.status_completed"),
    taken: t("orders.status_taken"),
    delivering: t("orders.status_delivering"),
    done: t("orders.status_done"),
    finished: t("orders.status_finished"),
    confirmed: t("orders.status_confirmed"),
  };

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
  }, [fetchOrders, notifications]);

  const handleConfirm = async (order) => {
    try {
      const originalOrder = orders.find((o) => o._id === order.id);
      const updatedOrder = { ...originalOrder, status: "confirmed" };

      await updateOrder({
        orderId: originalOrder._id,
        updatedData: updatedOrder,
      });

      sendNotification({
        userId: originalOrder.userId,
        title: t("orders.notification_status_update_title"),
        message: t("orders.notification_confirmed_message", { id: originalOrder._id }),
        orderId: originalOrder._id,
        type: "info",
      });

      fetchOrders();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const rows = orders.map((o) => ({
    id: o._id,
    orderNo: `#${generateOrderNumber(o._id)}`,
    customer: o.user?.name || o.shipInfo?.contactName || t("orders.unknown_customer"),
    quantity: o.items?.reduce((sum, i) => sum + (i.quantity || 0), 0),
    someItems: o.items,
    total: formatVND(o.finalTotal),
    createdAt: o.createdAt,
    status: statusTypes[o.status] || o.status,
    raw: o,
  }));

  const columns = [
    { field: "orderNo", headerName: t("orders.order_code"), width: 80, headerAlign: "center", align: "center" },
    { field: "customer", headerName: t("orders.customer"), width: 150, headerAlign: "center" },
    { field: "quantity", headerName: t("orders.item_count"), width: 80, headerAlign: "center", align: "center" },
    {
      field: "someItems",
      headerName: t("orders.ordered_dishes"),
      flex: 2,
      headerAlign: "center",
      align: "left",
      renderCell: (params) => {
        const items = params.row.someItems || [];
        const preview = items
          .slice(0, 2)
          .map((i) => i.dishName || i.dish?.name)
          .join(", ");
        const more = items.length > 2 ? ` +${items.length - 2} ${t("orders.more_items")}` : "";
        return (
          <span>
            {preview}
            {more}
          </span>
        );
      },
    },
    { field: "total", headerName: t("orders.total_amount"), width: 100, headerAlign: "center", align: "center" },
    {
      field: "createdAt",
      headerName: t("orders.created_at"),
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{new Date(params.value).toLocaleString("vi-VN") || ""}</span>,
    },
    { field: "status", headerName: t("orders.status"), width: 100, headerAlign: "center", align: "center" },
    {
      field: "action",
      headerName: t("common.actions"),
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
          onClick={(e) => {
            e.stopPropagation();
            handleConfirm(params.row);
          }}
        >
          {t("orders.confirm_order_btn")}
        </Button>
      ),
    },
  ];

  return (
    <div className='responsive-grid-table' style={{ height: "min(70vh, 560px)" }}>
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
