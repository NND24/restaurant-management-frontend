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
import { updateDish } from "@/service/dish";
import { getActiveStoreToppingGroups } from "@/service/topping";

const DishManageModal = ({ open, onClose, dishId, storeId, currentToppingGroups, onUpdated }) => {
  const [allToppingGroups, setAllToppingGroups] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(currentToppingGroups || []); // nhận nguyên object topping từ props
      const fetchData = async () => {
        try {
          const res = await getActiveStoreToppingGroups(storeId);
          setAllToppingGroups(res?.data || []);
        } catch (err) {
          console.error("Failed to load Dishes", err);
        }
      };
      fetchData();
    }
  }, [open, storeId, currentToppingGroups]);

  const handleSave = async () => {
    if (selected.length === 0) {
      toast.error("Cần chọn ít nhất 1 nh");
      return;
    }
    try {
      setLoading(true);
      await updateDish({ dishId, data: { toppingGroups: selected.map((t) => t._id) } });
      toast.success("Cập nhật món ăn thành công");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật món ăn thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        Quản lý nhóm món thêm trong món ăn
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Autocomplete
          multiple
          options={allToppingGroups}
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
              {option.name}
            </li>
          )}
          renderTags={() => null}
          renderInput={(params) => (
            <TextField {...params} variant='outlined' label='Chọn món ăn' placeholder='Chọn món thêm...' fullWidth />
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
                label={`${option.name}`}
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

export default DishManageModal;
