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
  CircularProgress,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getUnitById } from "@/service/unit";

const UnitDetailModal = ({ open, onClose, id }) => {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    storeId: "",
    isActive: true,
  });

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const res = await getUnitById(id);
          if (res?.success === true) {
            setFormData(res.data);
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
        Chi tiết đơn vị
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
              label='Tên đơn vị'
              name='name'
              value={formData.name || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              select
              label='Loại đơn vị'
              name='type'
              value={formData.type || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            >
              <MenuItem value='weight'>Khối lượng</MenuItem>
              <MenuItem value='volume'>Thể tích</MenuItem>
              <MenuItem value='count'>Số lượng</MenuItem>
            </TextField>

            <TextField
              select
              label='Trạng thái'
              name='isActive'
              value={formData.isActive}
              fullWidth
              InputProps={{ readOnly: true }}
            >
              <MenuItem value={true}>Hoạt động</MenuItem>
              <MenuItem value={false}>Ngưng hoạt động</MenuItem>
            </TextField>
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

export default UnitDetailModal;
