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
  Divider,
  Card,
  Chip,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getToppingGroupById } from "@/service/topping";

const ToppingGroupDetailModal = ({ open, onClose, id }) => {
  const [group, setGroup] = useState(null);

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        try {
          const res = await getToppingGroupById(id);
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
        Chi tiết Nhóm Món thêm
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField label='Tên nhóm' value={group.name} fullWidth InputProps={{ readOnly: true }} />

          <TextField
            label='Chọn 1 lần duy nhất'
            value={group.onlyOnce ? "Có" : "Không"}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label='Trạng thái'
            value={group.isActive ? "Hoạt động" : "Ngưng"}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <Box>
            <Typography variant='h6' sx={{ fontWeight: "bold", mb: 2 }}>
              Danh sách món thêm
            </Typography>

            {group.toppings?.map((top) => (
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

                {top.ingredients?.length > 0 && (
                  <Box mt={1}>
                    <Typography variant='body2' fontWeight='500' color='text.secondary'>
                      Nguyên liệu:
                    </Typography>
                    <List dense sx={{ pl: 2 }}>
                      {top.ingredients.map((ing) => (
                        <ListItem key={ing._id} sx={{ p: 0 }}>
                          <ListItemText
                            primary={`• ${ing.ingredient?.name || "Nguyên liệu"}: ${ing.quantity} ${
                              ing.ingredient?.unit?.name || ""
                            }`}
                            primaryTypographyProps={{ variant: "body2" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
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

export default ToppingGroupDetailModal;
