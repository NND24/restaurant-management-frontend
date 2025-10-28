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
  CircularProgress,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getIngredientCategoryById, updateIngredientCategory } from "@/service/ingredientCategory";
import { toast } from "react-toastify";

const IngredientCategoryEditModal = ({ open, onClose, id, onUpdated }) => {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const res = await getIngredientCategoryById(id);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? (value === "true" ? true : false) : value,
    }));
  };

  const handleSave = async () => {
    if (!id) return;

    if (!formData.name || formData.name.trim() === "") {
      toast.error("Tên loại nguyên liệu là bắt buộc");
      return;
    }

    try {
      setLoading(true);
      await updateIngredientCategory({ id, data: formData });
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật loại nguyên liệu:", err);
    } finally {
      setLoading(false);
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
        Chỉnh sửa loại nguyên liệu
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
            <TextField label='Tên' name='name' value={formData.name} onChange={handleChange} fullWidth required />

            <TextField
              label='Mô tả'
              name='description'
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />

            <TextField
              select
              label='Trạng thái'
              name='isActive'
              value={formData.isActive}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value={true}>Hoạt động</MenuItem>
              <MenuItem value={false}>Ngưng</MenuItem>
            </TextField>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3 }}>
        <Button onClick={onClose} color='error' variant='outlined'>
          Hủy
        </Button>
        <Button onClick={handleSave} color='primary' variant='contained' disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientCategoryEditModal;
