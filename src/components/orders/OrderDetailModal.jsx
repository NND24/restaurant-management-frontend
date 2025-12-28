"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getOrder } from "@/service/order";
import LatestOrder from "@/components/fragment/LatestOrder";
import ConfirmedOrder from "@/components/fragment/ConfirmedOrder";
import HistoryOrder from "@/components/fragment/HistoryOrder";

const OrderDetailModal = ({ open, onClose, orderId }) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetch, setRefetch] = useState(false);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const response = await getOrder({ orderId });
      setOrder(response?.data);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Lỗi khi tải đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !orderId) return;

    fetchOrder();
  }, [open, orderId]);

  const getOrderComponent = () => {
    if (!order) return <p>Không tìm thấy đơn hàng</p>;
    switch (order?.status) {
      case "pending":
        return <LatestOrder order={order} />;
      case "confirmed":
      case "finished":
      case "delivering":
        return <ConfirmedOrder order={order} setRefetch={setRefetch} onClose={onClose} />;
      default:
        return <HistoryOrder order={order} />;
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [refetch]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          py: 1,
          fontWeight: "bold",
          fontSize: "1.25rem",
          color: "#4a4b4d",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        Chi tiết đơn hàng
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box className='flex justify-center items-center h-40'>
            <CircularProgress color='warning' />
          </Box>
        ) : error ? (
          <p>{error}</p>
        ) : (
          getOrderComponent()
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3 }}>
        <Button onClick={onClose} color='primary' variant='contained'>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;
