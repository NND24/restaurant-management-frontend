"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getBatchById } from "@/service/ingredientBatch";

const IngredientBatchDetailModal = ({ open, onClose, id }) => {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    batchCode: "",
    ingredient: { _id: "", name: "" },
    quantity: 0,
    costPerUnit: 0,
    totalCost: 0,
    receivedDate: "",
    expiryDate: "",
    supplierName: "",
    storageLocation: "",
    status: "active",
  });

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const res = await getBatchById(id);
          if (res?.success) {
            setFormData(res.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, id]);

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
        Chi tiết lô nguyên liệu
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoadingData ? (
          <Box className='flex justify-center items-center h-40'>
            <CircularProgress color='warning' />
          </Box>
        ) : (
          <Box className='space-y-4'>
            {/* batchCode */}
            <TextField label='Mã lô' value={formData.batchCode || ""} fullWidth InputProps={{ readOnly: true }} />

            <TextField
              label='Nguyên liệu'
              value={formData.ingredient?.name || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label='Số lượng nhập'
                type='number'
                value={formData.quantity}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label='Giá / đơn vị'
                type='number'
                value={formData.costPerUnit}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Box>

            <TextField
              label='Tổng giá'
              type='number'
              value={formData.totalCost}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label='Ngày nhập'
                type='text'
                value={formData.receivedDate ? new Date(formData.receivedDate).toLocaleDateString() : ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label='Hạn sử dụng'
                type='text'
                value={formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString() : ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Box>

            <TextField label='Nhà cung cấp' value={formData.supplierName} fullWidth InputProps={{ readOnly: true }} />

            <TextField
              label='Vị trí lưu trữ'
              value={formData.storageLocation}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label='Trạng thái'
              value={
                formData.status === "active" ? "Hoạt động" : formData.status === "expired" ? "Hết hạn" : "Đã kết thúc"
              }
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Box>
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

export default IngredientBatchDetailModal;
