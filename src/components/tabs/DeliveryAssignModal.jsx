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
  Autocomplete,
  Alert,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { getAllStaff } from "@/service/staff";
import { assignDelivery } from "@/service/order";
import { useSocket } from "@/context/SocketContext";

const DELIVERY_TYPE = {
  IN_STORE: "IN_STORE",
  THIRD_PARTY: "THIRD_PARTY",
};

const DeliveryAssignModal = ({ open, onClose, storeId, orderId, order, shipInfo, onSuccess }) => {
  const { sendNotification } = useSocket();

  const isReassign = !!shipInfo?.deliverer?.name;

  const [formData, setFormData] = useState({
    deliveryType: DELIVERY_TYPE.IN_STORE,
    staff: null,
    delivererName: "",
    delivererPhone: "",
  });

  const [storeStaffs, setStoreStaffs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===== Fetch staff + prefill =====
  useEffect(() => {
    if (!open || !storeId) return;

    const fetchStaffs = async () => {
      try {
        const res = await getAllStaff(storeId);
        setStoreStaffs(res.data.employees || []);
      } catch {
        toast.error("Không tải được danh sách nhân viên");
      }
    };

    fetchStaffs();
  }, [open, storeId]);

  useEffect(() => {
    if (!open) return;

    if (!shipInfo?.deliverer) {
      setFormData({
        deliveryType: DELIVERY_TYPE.IN_STORE,
        staff: null,
        delivererName: "",
        delivererPhone: "",
      });
      return;
    }

    if (shipInfo.deliveryType === DELIVERY_TYPE.IN_STORE && storeStaffs.length > 0) {
      const matchedStaff = storeStaffs.find((s) => s._id === shipInfo.deliverer.staffId);

      setFormData({
        deliveryType: DELIVERY_TYPE.IN_STORE,
        staff: matchedStaff || null,
        delivererName: shipInfo.deliverer.name || "",
        delivererPhone: shipInfo.deliverer.phone || "",
      });
    }

    if (shipInfo.deliveryType === DELIVERY_TYPE.THIRD_PARTY) {
      setFormData({
        deliveryType: DELIVERY_TYPE.THIRD_PARTY,
        staff: null,
        delivererName: shipInfo.deliverer.name || "",
        delivererPhone: shipInfo.deliverer.phone || "",
      });
    }
  }, [open, shipInfo, storeStaffs]);

  // ===== Submit =====
  const handleSubmit = async () => {
    if (formData.deliveryType === DELIVERY_TYPE.IN_STORE) {
      if (!formData.staff) {
        return toast.error("Vui lòng chọn nhân viên giao hàng");
      }
    } else {
      if (!formData.delivererName || !formData.delivererPhone) {
        return toast.error("Vui lòng nhập đủ thông tin người giao");
      }
    }

    try {
      setLoading(true);

      const payload = {
        deliveryType: formData.deliveryType,
        staffId: formData.deliveryType === DELIVERY_TYPE.IN_STORE ? formData.staff._id : null,
        delivererName: formData.deliveryType === DELIVERY_TYPE.THIRD_PARTY ? formData.delivererName : undefined,
        delivererPhone: formData.deliveryType === DELIVERY_TYPE.THIRD_PARTY ? formData.delivererPhone : undefined,
      };

      console.log();
      await assignDelivery({ orderId: order._id, data: payload });

      sendNotification({
        userId: order.userId,
        title: "Cập nhật đơn hàng",
        message: isReassign
          ? `Đơn hàng #${order._id} đã được đổi người giao`
          : `Đơn hàng #${order._id} đã được bàn giao cho người giao`,
        orderId: order._id,
        type: "info",
      });

      toast.success(isReassign ? "Đã cập nhật người giao hàng" : "Đã bàn giao đơn hàng");

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        {isReassign ? "Gán lại người giao hàng" : "Bàn giao đơn hàng"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isReassign && (
          <Alert severity='info' sx={{ mb: 2 }}>
            Đơn hàng đang được giao. Việc này sẽ thay đổi người giao hàng hiện tại.
          </Alert>
        )}

        <Box className='space-y-4'>
          <TextField
            select
            label='Hình thức giao hàng'
            value={formData.deliveryType}
            onChange={(e) =>
              setFormData({
                deliveryType: e.target.value,
                staff: null,
                delivererName: "",
                delivererPhone: "",
              })
            }
            fullWidth
          >
            <MenuItem value={DELIVERY_TYPE.IN_STORE}>Nhân viên cửa hàng</MenuItem>
            <MenuItem value={DELIVERY_TYPE.THIRD_PARTY}>Người giao hàng bên ngoài</MenuItem>
          </TextField>

          {formData.deliveryType === DELIVERY_TYPE.IN_STORE && (
            <Autocomplete
              options={storeStaffs}
              value={formData.staff}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              getOptionLabel={(o) => `${o.name} - ${o.phonenumber}`}
              onChange={(e, staff) =>
                setFormData((prev) => ({
                  ...prev,
                  staff,
                }))
              }
              renderInput={(params) => <TextField {...params} label='Nhân viên giao hàng' />}
            />
          )}

          {formData.deliveryType === DELIVERY_TYPE.THIRD_PARTY && (
            <>
              <TextField
                label='Tên người giao'
                value={formData.delivererName}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    delivererName: e.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label='Số điện thoại'
                value={formData.delivererPhone}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    delivererPhone: e.target.value,
                  }))
                }
                fullWidth
              />
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='error' variant='outlined'>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant='contained' disabled={loading}>
          {loading ? "Đang xử lý..." : isReassign ? "Cập nhật người giao" : "Xác nhận bàn giao"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryAssignModal;
