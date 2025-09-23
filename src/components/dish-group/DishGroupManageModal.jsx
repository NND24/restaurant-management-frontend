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
  Chip,
  Paper,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { updateDishGroupById } from "@/service/dishGroup";
import { getAllDish } from "@/service/dish";

const DishGroupManageModal = ({ open, onClose, groupId, storeId, currentDishes, onUpdated }) => {
  const [allDishes, setAllDishes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(currentDishes || []); // nhận nguyên object topping từ props
      const fetchData = async () => {
        try {
          const res = await getAllDish(storeId);
          setAllDishes(res?.data || []);
        } catch (err) {
          console.error("Failed to load Dishes", err);
        }
      };
      fetchData();
    }
  }, [open, storeId, currentDishes]);

  const handleSave = async () => {
    if (selected.length === 0) {
      toast.error("Cần chọn ít nhất 1 món ăn");
      return;
    }
    try {
      setLoading(true);
      await updateDishGroupById({ dishGroupId: groupId, data: { dishes: selected.map((t) => t._id) } });
      toast.success("Cập nhật nhóm món ăn thành công");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật nhóm món ăn thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        Quản lý món ăn trong nhóm
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Autocomplete
          multiple
          options={allDishes}
          getOptionLabel={(option) => option.name}
          value={selected}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          onChange={(e, newValue) => setSelected(newValue)}
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
              {option.name} - {option.price.toLocaleString()}₫
            </li>
          )}
          renderTags={() => null}
          renderInput={(params) => (
            <TextField {...params} variant='outlined' label='Chọn món ăn' placeholder='Chọn topping...' fullWidth />
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

        {/* Chip list */}
        {selected.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
            {selected.map((option) => (
              <Chip
                key={option._id}
                label={`${option.name} - ${option.price.toLocaleString()}₫`}
                onDelete={() => setSelected((prev) => prev.filter((t) => t._id !== option._id))}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='error'>
          Hủy
        </Button>
        <Button onClick={handleSave} color='primary' variant='contained' disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DishGroupManageModal;
