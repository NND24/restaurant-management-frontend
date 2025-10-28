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
import { getIngredientById } from "@/service/ingredient";

const IngredientDetailModal = ({ open, onClose, id }) => {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: { _id: "", name: "" },
    category: { _id: "", name: "" },
    reorderLevel: 0,
    status: "ACTIVE", // mặc định
  });

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        try {
          setIsLoadingData(true);
          const res = await getIngredientById(id);
          if (res?.success === true) {
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

  // Map status -> label
  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Đang sử dụng";
      case "OUT_OF_STOCK":
        return "Hết hàng";
      case "INACTIVE":
        return "Ngưng sử dụng";
      default:
        return "Không xác định";
    }
  };

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
        Chi tiết nguyên liệu
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
            <TextField label='Tên nguyên liệu' value={formData.name} fullWidth InputProps={{ readOnly: true }} />

            <TextField
              label='Mô tả'
              value={formData.description}
              fullWidth
              multiline
              rows={2}
              InputProps={{ readOnly: true }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label='Đơn vị tính'
                value={formData.unit?.name || ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label='Loại nguyên liệu'
                value={formData.category?.name || ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Box>

            <TextField
              label='Ngưỡng tồn kho cảnh báo'
              type='number'
              value={formData.reorderLevel}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label='Trạng thái'
              value={getStatusLabel(formData.status)}
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

export default IngredientDetailModal;
