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
  Typography,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { createUnit, getBaseUnits } from "@/service/unit";
import { toast } from "react-toastify";

const UnitCreateModal = ({ open, onClose, storeId, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    baseUnit: "", // STRING: name của unit gốc
    ratio: 1,
    isActive: true,
  });

  const [baseUnits, setBaseUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= RESET FORM ================= */
  useEffect(() => {
    if (!open) return;
    setFormData({
      name: "",
      type: "",
      baseUnit: "",
      ratio: 1,
      isActive: true,
    });
    setBaseUnits([]);
  }, [open]);

  /* ================= LOAD BASE UNITS ================= */
  useEffect(() => {
    if (!formData.type) return;

    getBaseUnits(storeId, formData.type)
      .then((res) => {
        // chỉ lấy unit gốc (ratio === 1 hoặc baseUnit null)
        setBaseUnits(res.data || []);
      })
      .catch(() => setBaseUnits([]));
  }, [formData.type, storeId]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // đổi type → reset baseUnit & ratio
      if (name === "type" && value !== prev.type) {
        return {
          ...prev,
          type: value,
          baseUnit: "",
          ratio: 1,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const isBaseUnit = !formData.baseUnit;

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!formData.name || !formData.type) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!isBaseUnit && Number(formData.ratio) <= 0) {
      toast.error("Tỉ lệ quy đổi phải > 0");
      return;
    }

    const payload = {
      storeId,
      name: formData.name.trim(),
      type: formData.type,
      baseUnit: isBaseUnit ? null : formData.baseUnit, // STRING
      ratio: isBaseUnit ? 1 : Number(formData.ratio),
      isActive: true,
    };

    try {
      setLoading(true);
      await createUnit(payload);
      toast.success("Tạo đơn vị thành công");
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Thêm đơn vị
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          {/* ===== TÊN ===== */}
          <TextField
            label='Tên đơn vị'
            name='name'
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            placeholder='vd: gram, kg, ml...'
          />

          {/* ===== TYPE ===== */}
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

          {/* ===== BASE UNIT ===== */}
          {formData.type && (
            <TextField
              select
              label='Đơn vị gốc'
              name='baseUnit'
              value={formData.baseUnit}
              onChange={handleChange}
              fullWidth
              helperText='Không chọn = đơn vị gốc'
            >
              <MenuItem value=''>— Đơn vị gốc —</MenuItem>
              {baseUnits.map((u) => (
                <MenuItem key={u._id} value={u.name}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* ===== RATIO ===== */}
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
                helperText='Ví dụ: 1 kg = 1000 gram'
              />

              <Typography variant='body2' color='text.secondary'>
                ➜ 1 {formData.name || "?"} = {formData.ratio} {formData.baseUnit}
              </Typography>
            </>
          )}
        </Box>
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

export default UnitCreateModal;
