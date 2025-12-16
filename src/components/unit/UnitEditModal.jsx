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
  Typography,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getUnitById, updateUnit } from "@/service/unit";
import { toast } from "react-toastify";

const UnitEditModal = ({ open, onClose, id, storeId, onUpdated }) => {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    baseUnit: null,
    ratio: 1,
    isActive: true,
    storeId,
  });

  const isBaseUnit = !formData.baseUnit || formData.baseUnit === formData.name;

  useEffect(() => {
    if (!open || !id) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const res = await getUnitById(id);
        if (res?.success) {
          setFormData({
            name: res.data.name,
            type: res.data.type,
            baseUnit: res.data.baseUnit || null,
            ratio: res.data.ratio || 1,
            isActive: res.data.isActive,
          });
        }
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu đơn vị");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [open, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? value === "true" : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Tên đơn vị là bắt buộc");
      return;
    }

    if (!isBaseUnit && formData.ratio <= 0) {
      toast.error("Tỉ lệ quy đổi phải lớn hơn 0");
      return;
    }

    try {
      setLoading(true);
      await updateUnit({
        id,
        data: {
          name: formData.name,
          ratio: isBaseUnit ? 1 : Number(formData.ratio),
          isActive: formData.isActive,
          storeId,
        },
      });
      toast.success("Cập nhật đơn vị thành công");
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error("Không thể cập nhật đơn vị");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Chỉnh sửa đơn vị
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoadingData ? (
          <Box className='flex justify-center items-center h-40'>
            <CircularProgress />
          </Box>
        ) : (
          <Box className='space-y-4'>
            <TextField
              label='Tên đơn vị'
              name='name'
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              select
              label='Loại đơn vị'
              name='type'
              value={formData.type}
              onChange={handleChange}
              fullWidth
              required
              disabled
            >
              <MenuItem value='weight'>Khối lượng</MenuItem>
              <MenuItem value='volume'>Thể tích</MenuItem>
              <MenuItem value='count'>Số lượng</MenuItem>
            </TextField>

            {!isBaseUnit && (
              <>
                <TextField
                  label='Tỉ lệ quy đổi'
                  name='ratio'
                  type='number'
                  value={formData.ratio}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0.0001, step: 0.0001 }}
                  InputProps={{ readOnly: true }}
                />

                <Typography variant='body2' color='text.secondary'>
                  ➜ 1 {formData.name} = {formData.ratio} {formData.baseUnit}
                </Typography>
              </>
            )}

            <TextField
              select
              label='Trạng thái'
              name='isActive'
              value={String(formData.isActive)}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value='true'>Hoạt động</MenuItem>
              <MenuItem value='false'>Ngưng</MenuItem>
            </TextField>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='error' variant='outlined'>
          Hủy
        </Button>
        <Button onClick={handleSave} variant='contained' disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnitEditModal;
