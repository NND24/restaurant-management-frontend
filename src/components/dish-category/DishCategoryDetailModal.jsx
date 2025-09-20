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
  MenuItem,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getCategoryById } from "@/service/dishCategory";

const DishCategoryDetailModal = ({ open, onClose, id }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        try {
          const res = await getCategoryById(id);
          if (res?.success === true) {
            setFormData(res.data);
          }
        } catch (err) {
          console.error(err);
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
        Chi tiết loại món ăn
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField label='Tên' name='name' value={formData.name} fullWidth InputProps={{ readOnly: true }} />

          <TextField
            label='Mô tả'
            name='description'
            value={formData.description}
            fullWidth
            multiline
            rows={3}
            InputProps={{ readOnly: true }}
          />

          <TextField select label='Trạng thái' value={formData.isActive} fullWidth InputProps={{ readOnly: true }}>
            <MenuItem value={true}>Hoạt động</MenuItem>
            <MenuItem value={false}>Ngưng</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3 }}>
        <Button onClick={onClose} color='primary' variant='contained'>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DishCategoryDetailModal;
