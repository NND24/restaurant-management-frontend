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
  CircularProgress,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getWasteById } from "@/service/waste";

const reasonMap = {
  expired: "Hết hạn",
  spoiled: "Bị hỏng",
  damaged: "Bị hư hại",
  other: "Khác",
};

const WasteDetailModal = ({ open, onClose, id }) => {
  const [waste, setWaste] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (open && id) {
      setIsLoadingData(true);
      const fetchData = async () => {
        try {
          const res = await getWasteById(id);
          if (res?.success) {
            setWaste(res.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, id]);

  if (!waste) return null;

  const ingredient = waste.ingredientBatchId?.ingredient;
  const reason = waste.reason === "other" ? waste.otherReason || "Khác" : reasonMap[waste.reason] || "Không xác định";

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
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
        Chi tiết nguyên liệu hỏng
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
          <Box className='space-y-3'>
            <TextField
              label='Nguyên liệu'
              value={ingredient?.name || "Không xác định"}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label='Số lượng hỏng'
              value={`${waste.quantity} ${ingredient?.unit?.name || ""}`}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField label='Lý do' value={reason} fullWidth InputProps={{ readOnly: true }} />

            <TextField
              label='Ngày'
              value={new Date(waste.date).toLocaleString("vi-VN")}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label='Nhân viên ghi nhận'
              value={waste.staff?.name || "Không rõ"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3 }}>
        <Button onClick={onClose} color='primary' variant='contained'>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WasteDetailModal;
