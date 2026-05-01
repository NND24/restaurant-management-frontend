"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getAllOrders, updateOrder } from "@/service/order";
import generateOrderNumber from "../../utils/generateOrderNumber";
import { Button } from "@mui/material";
import { useSocket } from "@/context/SocketContext";
import { viVN } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import OrderDetailModal from "../orders/OrderDetailModal";
import DeliveryAssignModal from "./DeliveryAssignModal";

const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

export default function VerifyOrderTab({ storeId }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDetailOrder, setOpenDetailOrder] = useState(false);
  const [openAssignDelivery, setOpenAssignDelivery] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    setIsLoading(true);
    try {
      const res = await getAllOrders({
        storeId,
        status: ["confirmed", "finished", "delivering"],
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
  }, [fetchOrders, notifications]);

  const handleUpdateOrder = async (order, status) => {
    try {
      const originalOrder = orders.find((o) => o._id === order.id);
      await updateOrder({
        orderId: order.id,
        updatedData: { ...originalOrder, status },
      });
      sendNotification({
        userId: order.userId,
        title: t("orders.notification_status_update_title"),
        message: t("orders.notification_status_update_message", { id: order.id, status: statusTypes[status] }),
        orderId: order.id,
        type: "info",
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
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
      flex: 1,
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
    { field: "total", headerName: t("orders.total_amount"), width: 130, headerAlign: "center", align: "center" },
    {
      field: "createdAt",
      headerName: t("orders.created_at"),
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{new Date(params.value).toLocaleString("vi-VN") || ""}</span>,
    },
    { field: "status", headerName: t("orders.status"), width: 160, headerAlign: "center", align: "center" },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const order = params.row.raw;
        if (order.status === "delivering") {
          return (
            <Button
              variant='contained'
              color='warning'
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(order.id);
                setSelectedOrder(order);
                setOpenAssignDelivery(true);
              }}
            >
              {t("orders.update_delivery_person_btn")}
            </Button>
          );
        }
        return (
          <Button
            variant='contained'
            color='primary'
            size='small'
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(order.id);
              setSelectedOrder(order);
              setOpenAssignDelivery(true);
            }}
          >
            {t("orders.assign_delivery_btn")}
          </Button>
        );
      },
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

      {openAssignDelivery && (
        <DeliveryAssignModal
          open={openAssignDelivery}
          onClose={() => setOpenAssignDelivery(false)}
          storeId={storeId}
          orderId={selectedId}
          order={selectedOrder}
          shipInfo={selectedOrder?.shippingInfo}
          onSuccess={() => {
            setOpenAssignDelivery(false);
            fetchOrders();
          }}
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
