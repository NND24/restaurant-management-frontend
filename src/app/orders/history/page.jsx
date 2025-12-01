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

const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

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

const page = () => {
  const [storeId, setStoreId] = useState(localStorageService.getStoreId());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetailOrder, setOpenDetailOrder] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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
  }, [storeId]);

  const columns = [
    {
      field: "id",
      headerName: "Mã đơn",
      width: 80,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>#{generateOrderNumber(params.value)}</span>,
    },
    {
      field: "customer",
      headerName: "Khách hàng",
      width: 150,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) => row?.user?.name || "Ẩn danh",
    },
    {
      field: "items",
      headerName: "Số món",
      width: 80,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) =>
        Array.isArray(row?.items) ? row.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0,
    },
    {
      field: "someItems",
      headerName: "Món ăn được đặt",
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
      headerName: "Tổng tiền",
      width: 100,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) => (typeof row?.finalTotal === "number" ? formatVND(row.finalTotal) : "0 ₫"),
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{new Date(params.value).toLocaleString("vi-VN") || ""}</span>,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      headerAlign: "center",
      align: "center",
      valueGetter: (_, row) => statusTypes[row?.status] || "--",
    },
  ];

  if (!storeId) {
    return (
      <div className='flex justify-center items-center h-screen w-screen'>
        <ThreeDots visible={true} height='80' width='80' color='#fc6011' radius='9' ariaLabel='three-dots-loading' />
      </div>
    );
  }

  return (
    <div className='p-5'>
      <Heading title='Lịch sử đơn hàng' description='' keywords='' />
      <div style={{ height: "95vh", width: "100%" }}>
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
          rows={orders}
          columns={columns}
          getRowId={(row) => row._id}
          onRowClick={(params) => {
            setSelectedId(params.row.id);
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
