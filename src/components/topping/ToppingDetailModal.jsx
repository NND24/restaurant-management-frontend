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
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getToppingById } from "@/service/topping";

const ToppingDetailModal = ({ open, onClose, id }) => {
  const [topping, setTopping] = useState(null);

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        try {
          const res = await getToppingById(id);
          if (res?.success) {
            setTopping(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [open, id]);

  if (!topping) return null;

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
        Chi tiết Món thêm
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField label='Tên Món thêm' value={topping.name} fullWidth InputProps={{ readOnly: true }} />

          <TextField label='Giá' value={topping.price} fullWidth InputProps={{ readOnly: true }} />

          <Box>
            <Typography variant='subtitle1' sx={{ mb: 0, fontWeight: "bold" }}>
              Nguyên liệu
            </Typography>
            <List dense>
              {topping.ingredients?.map((ing) => (
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

          <TextField
            label='Trạng thái'
            value={topping.isActive ? "Hoạt động" : "Ngưng"}
            fullWidth
            InputProps={{ readOnly: true }}
          />
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

export default ToppingDetailModal;
