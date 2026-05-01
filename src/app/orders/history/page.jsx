"use client";
import { ThreeDots } from "react-loader-spinner";
import localStorageService from "@/utils/localStorageService";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getAllOrders } from "@/service/order";
import { viVN } from "@/utils/constants";
import generateOrderNumber from "@/utils/generateOrderNumber";
import OrderDetailModal from "@/components/orders/OrderDetailModal";
import Heading from "@/components/Heading";
import { useSocket } from "@/context/SocketContext";
import { useTranslation } from "react-i18next";

const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

const page = () => {
  const { t } = useTranslation();

  const statusTypes = {
    pending: t("orders.status_pending"),
    preparing: t("orders.status_preparing"),
    delivered: t("orders.status_delivered"),
    cancelled: t("orders.status_cancelled"),
    completed: t("orders.status_completed"),
    taken: t("orders.status_taken"),
    delivering: t("orders.status_delivering"),
    done: t("orders.status_done"),
    finished: t("orders.status_finished"),
    confirmed: t("orders.status_confirmed"),
  };

  const [storeId, setStoreId] = useState(localStorageService.getStoreId());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetailOrder, setOpenDetailOrder] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const { notifications } = useSocket();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders({
        storeId,
        status: ["completed", "delivered", "done", "cancelled", "taken"],
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
  }, [storeId, notifications]);

  const columns = [
    {
      field: "_id",
      headerName: t("orders.order_code"),
      width: 80,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>#{generateOrderNumber(params.value)}</span>,
    },
    {
      field: "customer",
      headerName: t("orders.customer"),
      width: 150,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) => row?.user?.name || t("orders.anonymous"),
    },
    {
      field: "items",
      headerName: t("orders.item_count"),
      width: 80,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) =>
        Array.isArray(row?.items) ? row.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0,
    },
    {
      field: "someItems",
      headerName: t("orders.ordered_items"),
      flex: 1,
      headerAlign: "center",
      align: "left",
      renderCell: (params) => {
        const items = params.row.items || [];
        const preview = items.map((i) => i.dishName || i.dish?.name).join(", ");
        return <span>{preview}</span>;
      },
    },
    {
      field: "finalTotal",
      headerName: t("orders.total_amount"),
      width: 100,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) => (typeof row?.finalTotal === "number" ? formatVND(row.finalTotal) : "0 ₫"),
    },
    {
      field: "createdAt",
      headerName: t("orders.created_at"),
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{new Date(params.value).toLocaleString("vi-VN") || ""}</span>,
    },
    {
      field: "status",
      headerName: t("common.status"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) => statusTypes[row?.status] || "--",
    },
  ];

  if (!storeId) {
    return (
      <div className='flex min-h-screen w-full items-center justify-center'>
        <ThreeDots visible={true} height='80' width='80' color='#fc6011' radius='9' ariaLabel='three-dots-loading' />
      </div>
    );
  }

  return (
    <div className='page-shell'>
      <Heading title={t("orders.history_title")} description='' keywords='' />
      <div className='responsive-grid-table' style={{ height: "calc(100vh - 160px)" }}>
        {openDetailOrder && (
          <OrderDetailModal
            open={openDetailOrder}
            onClose={() => {
              setOpenDetailOrder(false);
            }}
            orderId={selectedId}
          />
        )}

        <DataGrid
          rows={orders}
          columns={columns}
          getRowId={(row) => row._id}
          onRowClick={(params) => {
            setSelectedId(params.row._id);
            setOpenDetailOrder(true);
          }}
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
    </div>
  );
};

export default page;
