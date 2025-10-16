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
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getDish } from "@/service/dish";

const DishDetailModal = ({ open, onClose, id }) => {
  const [dish, setDish] = useState(null);

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        try {
          const res = await getDish(id);
          if (res?.success) {
            setDish(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [open, id]);

  if (!dish) return null;

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Hoạt động";
      case "OUT_OF_STOCK":
        return "Hết hàng";
      case "INACTIVE":
        return "Ngưng";
      default:
        return "Không xác định";
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
        Chi tiết món ăn
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          {/* Tên món */}
          <TextField label='Tên món' value={dish.name} fullWidth InputProps={{ readOnly: true }} />

          {/* Giá */}
          <TextField label='Giá' value={dish.price} fullWidth InputProps={{ readOnly: true }} />

          {/* Hình ảnh */}
          {dish.image?.url && (
            <Box>
              <Typography variant='subtitle1' sx={{ mb: 0.5, fontWeight: "bold" }}>
                Hình ảnh
              </Typography>
              <img
                src={dish.image.url}
                alt={dish.name}
                style={{ width: 200, height: 150, objectFit: "cover", borderRadius: 8 }}
              />
            </Box>
          )}

          {/* Mô tả */}
          {dish.description && (
            <TextField
              label='Mô tả'
              value={dish.description}
              fullWidth
              multiline
              rows={3}
              InputProps={{ readOnly: true }}
            />
          )}

          {dish.category && (
            <TextField
              label='Phân loại món'
              value={dish.category?.name || "Không có"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          )}

          {/* Nguyên liệu */}
          {dish.ingredients?.length > 0 && (
            <Box>
              <Typography variant='subtitle1' sx={{ mb: 0.5, fontWeight: "bold" }}>
                Nguyên liệu
              </Typography>
              <List dense>
                {dish.ingredients.map((ing) => (
                  <ListItem key={ing._id} sx={{ p: 0 }}>
                    <ListItemText
                      primary={`${ing.ingredient?.name || "Nguyên liệu"}: ${ing.quantity} ${
                        ing.ingredient?.unit?.name || ""
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Nhóm topping */}
          {dish.toppingGroups?.length > 0 && (
            <Box>
              <Typography variant='subtitle1' sx={{ mb: 0.5, fontWeight: "bold" }}>
                Nhóm món thêm
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {dish.toppingGroups.map((tg) => (
                  <Chip key={tg._id} label={tg.name} sx={{ backgroundColor: "#fc6011", color: "#fff" }} />
                ))}
              </Box>
            </Box>
          )}

          <TextField label='Trạng thái' value={getStatusLabel(dish.status)} fullWidth InputProps={{ readOnly: true }} />
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

export default DishDetailModal;
