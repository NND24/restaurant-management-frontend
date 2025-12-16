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
    quantity: 0, // luôn lưu theo BASE UNIT
    costPerUnit: 0,
    receivedDate: "",
    expiryDate: "",
    supplierName: "",
    storageLocation: "",
    status: "active",
    inputUnit: null, // 🔥 QUAN TRỌNG
  });

  /* ================= DERIVED VALUES ================= */
  const inputUnit = formData.inputUnit;

  // hiển thị số lượng theo đơn vị đã nhập
  const displayQuantity = inputUnit && inputUnit.ratio ? formData.quantity / inputUnit.ratio : formData.quantity;

  // tính tổng giá an toàn
  const totalCost = formData.quantity && formData.costPerUnit ? formData.quantity * formData.costPerUnit : 0;

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!open || !id) return;

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
  }, [open, id]);

  /* ================= RENDER ================= */
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
            {/* Mã lô */}
            <TextField label='Mã lô' value={formData.batchCode || ""} fullWidth InputProps={{ readOnly: true }} />

            {/* Nguyên liệu */}
            <TextField
              label='Nguyên liệu'
              value={formData.ingredient?.name || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            {/* Quy đổi */}
            {inputUnit?.ratio > 1 && inputUnit?.baseUnit && (
              <Box fontSize={12} color='gray'>
                (Quy đổi: 1 {inputUnit.name} = {inputUnit.ratio} {inputUnit.baseUnit})
              </Box>
            )}

            {/* Số lượng + giá */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label={`Số lượng nhập (${inputUnit?.name || "đơn vị"})`}
                type='number'
                value={displayQuantity}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              <TextField
                label={`Giá / ${inputUnit?.name || "đơn vị"}`}
                type='number'
                value={formData.costPerUnit}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Box>

            {/* Tổng giá */}
            <TextField label='Tổng giá' type='number' value={totalCost} fullWidth InputProps={{ readOnly: true }} />

            {/* Ngày */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label='Ngày nhập'
                value={formData.receivedDate ? new Date(formData.receivedDate).toLocaleDateString("vi-VN") : ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              <TextField
                label='Hạn sử dụng'
                value={formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString("vi-VN") : ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Box>

            {/* Nhà cung cấp */}
            <TextField
              label='Nhà cung cấp'
              value={formData.supplierName || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            {/* Vị trí */}
            <TextField
              label='Vị trí lưu trữ'
              value={formData.storageLocation || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            {/* Trạng thái */}
            <TextField
              label='Trạng thái'
              value={
                formData.status === "active" ? "Hoạt động" : formData.status === "expired" ? "Hết hạn" : "Đã dùng hết"
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
