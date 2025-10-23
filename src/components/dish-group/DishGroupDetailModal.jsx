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
  Card,
  Chip,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getDishGroupById } from "@/service/dishGroup";

const DishGroupDetailModal = ({ open, onClose, id }) => {
  const [group, setGroup] = useState(null);

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        try {
          const res = await getDishGroupById(id);
          if (res?.success) {
            setGroup(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [open, id]);

  if (!group) return null;

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
        Chi tiết nhóm món ăn
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField label='Tên nhóm' value={group.name} fullWidth InputProps={{ readOnly: true }} />

          <TextField
            label='Trạng thái'
            value={group.isActive ? "Hoạt động" : "Ngưng"}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <Box>
            <Typography variant='h6' sx={{ fontWeight: "bold", mb: 2 }}>
              Danh sách món ăn
            </Typography>

            {group.dishes?.map((top) => (
              <Card
                key={top._id}
                variant='outlined'
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Typography variant='subtitle1' fontWeight='600'>
                    {top.name}
                  </Typography>
                  <Chip label={`${top.price.toLocaleString()}₫`} color='primary' size='small' />
                </Box>
              </Card>
            ))}
          </Box>
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

export default DishGroupDetailModal;
