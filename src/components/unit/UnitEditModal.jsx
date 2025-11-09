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
import { getUnitById, updateUnit } from "@/service/unit";
import { toast } from "react-toastify";

const UnitEditModal = ({ open, onClose, id, onUpdated }) => {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    storeId: storeId,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const res = await getUnitById(id);
          if (res?.success === true) {
            setFormData(res.data);
          }
        } catch (err) {
          console.error(err);
          toast.error("Lỗi khi tải dữ liệu đơn vị");
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

    if (!formData.name.trim()) {
      toast.error("Tên đơn vị là bắt buộc");
      return;
    }

    if (!formData.type) {
      toast.error("Vui lòng chọn loại đơn vị");
      return;
    }

    try {
      setLoading(true);
      await updateUnit({ id, data: formData });
      toast.success("Cập nhật đơn vị thành công!");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật đơn vị:", err);
      toast.error("Không thể cập nhật đơn vị");
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
        Chỉnh sửa đơn vị
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
            {/* Tên đơn vị */}
            <TextField
              label='Tên đơn vị'
              name='name'
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Loại đơn vị */}
            <TextField
              select
              label='Loại đơn vị'
              name='type'
              value={formData.type}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value='weight'>Khối lượng</MenuItem>
              <MenuItem value='volume'>Thể tích</MenuItem>
              <MenuItem value='count'>Số lượng</MenuItem>
            </TextField>

            {/* Trạng thái */}
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

export default UnitEditModal;
