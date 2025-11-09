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
import { createUnit } from "@/service/unit";

const UnitCreateModal = ({ open, onClose, storeId, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        type: "",
        isActive: true,
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.type) return;

    try {
      setLoading(true);
      await createUnit({
        storeId,
        name: formData.name,
        type: formData.type,
        isActive: formData.isActive,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
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
        Thêm đơn vị
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField
            label='Tên đơn vị'
            name='name'
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!formData.name}
            helperText={!formData.name ? "Tên đơn vị là bắt buộc" : ""}
          />

          <TextField
            select
            label='Loại đơn vị'
            name='type'
            value={formData.type}
            onChange={handleChange}
            fullWidth
            required
            error={!formData.type}
            helperText={!formData.type ? "Chọn loại đơn vị" : ""}
          >
            <MenuItem value='weight'>Khối lượng</MenuItem>
            <MenuItem value='volume'>Thể tích</MenuItem>
            <MenuItem value='count'>Số lượng</MenuItem>
          </TextField>

          <TextField
            select
            label='Trạng thái'
            name='isActive'
            value={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                isActive: e.target.value === "true",
              }))
            }
            fullWidth
          >
            <MenuItem value='true'>Hoạt động</MenuItem>
            <MenuItem value='false'>Ngưng hoạt động</MenuItem>
          </TextField>
        </Box>
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

export default UnitCreateModal;
