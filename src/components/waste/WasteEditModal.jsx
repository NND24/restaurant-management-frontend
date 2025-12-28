"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import { Autocomplete } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { getWasteById, updateWaste } from "@/service/waste";

const WasteEditModal = ({ open, onClose, storeId, id, onUpdated }) => {
  const [formData, setFormData] = useState({
    ingredientBatch: null,
    quantity: "",
    reason: "",
    otherReason: "",
  });
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [displayUnit, setDisplayUnit] = useState(null);
  const [waste, setWaste] = useState(null);

  // load data khi mở modal
  useEffect(() => {
    if (open && id) {
      setIsLoadingData(true);
      const fetchData = async () => {
        try {
          // load waste detail
          const wasteRes = await getWasteById(id);
          if (wasteRes?.success) {
            const data = wasteRes.data;
            setWaste(data);

            const displayUnit = data?.ingredientBatchId?.inputUnit || data?.ingredientBatchId?.ingredient?.unit || null;
            setDisplayUnit(displayUnit);
            setFormData({
              ingredientBatch: data.ingredientBatchId, // populate từ backend
              quantity: data.quantity,
              reason: data.reason,
              otherReason: data.otherReason || "",
            });
          }
        } catch (err) {
          console.error("Failed to load waste detail", err);
          toast.error("Không tải được dữ liệu nguyên liệu hỏng");
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, id, storeId]);

  const handleSave = async () => {
    if (!formData.ingredientBatch) {
      toast.error("Cần chọn lô nguyên liệu");
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error("Số lượng hỏng phải > 0");
      return;
    }
    if (!formData.reason) {
      toast.error("Cần chọn lý do");
      return;
    }
    if (Number(formData.quantity) > formData.ingredientBatch.remainingQuantity) {
      toast.error("Số lượng hỏng vượt quá tồn kho hiện tại");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ingredientBatchId: formData.ingredientBatch._id,
        quantity: Number(formData.quantity),
        reason: formData.reason,
        otherReason: formData.reason === "other" ? formData.otherReason : undefined,
      };
      await updateWaste({ id, data: payload });
      toast.success("Cập nhật nguyên liệu hỏng thành công");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật nguyên liệu hỏng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const ingredient = waste?.ingredientBatchId?.ingredient;
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        Chỉnh sửa nguyên liệu hỏng
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
            <TextField
              label='Nguyên liệu'
              value={ingredient?.name || "Không xác định"}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label={`Số lượng hỏng ${displayUnit ? `(${displayUnit.name})` : ""}`}
              type='number'
              value={formData.quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
              fullWidth
            />

            {displayUnit && Number(formData.quantity) > 0 && displayUnit.ratio > 1 && displayUnit.baseUnit && (
              <Box sx={{ fontSize: 13, color: "gray" }}>
                Quy đổi:{" "}
                <b>
                  {formData.quantity} {displayUnit.name}
                </b>{" "}
                ={" "}
                <b>
                  {formData.quantity * displayUnit.ratio} {displayUnit.baseUnit}
                </b>
              </Box>
            )}

            <TextField
              select
              label='Lý do'
              value={formData.reason}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              fullWidth
            >
              <MenuItem value='expired'>Hết hạn</MenuItem>
              <MenuItem value='spoiled'>Bị hỏng</MenuItem>
              <MenuItem value='damaged'>Bị hư hại</MenuItem>
              <MenuItem value='other'>Khác</MenuItem>
            </TextField>

            {formData.reason === "other" && (
              <TextField
                label='Lý do khác'
                value={formData.otherReason}
                onChange={(e) => setFormData((prev) => ({ ...prev, otherReason: e.target.value }))}
                fullWidth
              />
            )}
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

export default WasteEditModal;
