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
  Checkbox,
  FormControlLabel,
  Chip,
  Paper,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { createToppingGroup, getStoreToppings } from "@/service/topping";

const ToppingGroupCreateToDishModal = ({ open, onClose, storeId, dish, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
    onlyOnce: false,
    toppings: [],
  });
  const [allToppings, setAllToppings] = useState([]);
  const [loading, setLoading] = useState(false);

  // reset + load toppings khi mở modal
  useEffect(() => {
    if (open) {
      setFormData({ name: "", isActive: true, onlyOnce: false, toppings: [] });
      const fetchToppings = async () => {
        try {
          const res = await getStoreToppings(storeId); // API trả về tất cả topping của store
          setAllToppings(res?.data || []);
        } catch (err) {
          console.error("Failed to load toppings", err);
        }
      };
      fetchToppings();
    }
  }, [open, storeId]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Tên Nhóm món thêm là bắt buộc");
      return;
    }
    if (formData.toppings.length === 0) {
      toast.error("Cần chọn ít nhất 1 món thêm");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        isActive: formData.isActive,
        onlyOnce: formData.onlyOnce,
        toppings: formData.toppings.map((t) => t._id),
        dishIds: [dish._id],
        storeId,
      };
      await createToppingGroup({ storeId, data: payload });
      toast.success("Thêm nhóm món thêm thành công");
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Thêm nhóm món thêm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        Thêm nhóm món thêm cho món ăn
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField label='Món ăn' value={dish?.name} fullWidth InputProps={{ readOnly: true }} />

          <TextField
            label='Tên nhóm món thêm'
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
          />

          {/* Autocomplete chọn topping */}
          <Autocomplete
            multiple
            options={allToppings}
            getOptionLabel={(option) => option.name}
            value={formData.toppings}
            onChange={(e, newValue) => setFormData((prev) => ({ ...prev, toppings: newValue }))}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
              <li
                {...props}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  backgroundColor: selected ? "#fcf0e8" : "white",
                  cursor: "pointer",
                }}
              >
                <input
                  type='checkbox'
                  checked={selected}
                  readOnly
                  style={{ width: 16, height: 16, accentColor: "#fc6011" }}
                />
                {option.name}
              </li>
            )}
            renderTags={() => null}
            renderInput={(params) => (
              <TextField {...params} variant='outlined' label='Chọn món thêm' placeholder='Chọn topping...' fullWidth />
            )}
            PaperComponent={({ children }) => (
              <Paper
                elevation={3}
                sx={{
                  maxHeight: 240,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": { backgroundColor: "#fc6011", borderRadius: 3 },
                }}
              >
                {children}
              </Paper>
            )}
            fullWidth
          />

          {/* Chip list hiển thị riêng dưới input */}
          {formData.toppings.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
              {formData.toppings.map((option) => (
                <Chip
                  key={option._id}
                  label={option.name}
                  onDelete={() =>
                    setFormData((prev) => ({
                      ...prev,
                      toppings: prev.toppings.filter((t) => t._id !== option._id),
                    }))
                  }
                  size='medium'
                  sx={{
                    backgroundColor: "#fc6011",
                    color: "#fff",
                    fontWeight: 500,
                    borderRadius: "16px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  }}
                />
              ))}
            </Box>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.onlyOnce}
                onChange={(e) => setFormData((prev) => ({ ...prev, onlyOnce: e.target.checked }))}
              />
            }
            label='Chỉ chọn được 1 món thêm trong nhóm'
          />

          <TextField
            select
            label='Trạng thái'
            value={formData.isActive}
            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value='true'>Hoạt động</option>
            <option value='false'>Ngưng</option>
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

export default ToppingGroupCreateToDishModal;
