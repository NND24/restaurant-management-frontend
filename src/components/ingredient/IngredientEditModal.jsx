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
import { getIngredientById, updateIngredient } from "@/service/ingredient";
import { getUnits } from "@/service/unit";
import { getIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const IngredientEditModal = ({ open, onClose, id, storeId, onUpdated }) => {
  const { t } = useTranslation();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitType: "",
    unit: "",
    category: "",
    reorderLevel: 0,
    status: "ACTIVE",
  });

  const [allUnits, setAllUnits] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Units + Categories
  useEffect(() => {
    if (open) {
      getUnits(storeId, true).then((res) => {
        if (res?.success) setAllUnits(res.data);
      });
      getIngredientCategoriesByStore(storeId).then((res) => {
        if (res?.success) setAllCategories(res.data);
      });
    }
  }, [open, storeId]);

  // Load Ingredient by id
  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        try {
          setIsLoadingData(true);
          const res = await getIngredientById(id);
          if (res?.success === true) {
            const ing = res.data;
            setFormData({
              name: ing.name,
              description: ing.description || "",
              unitType: ing.unit?.type || "",
              unit: ing.unit?._id || "",
              category: ing.category?._id || "",
              reorderLevel: ing.reorderLevel || 0,
              status: ing.status || "ACTIVE",
            });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!id) return;

    if (!formData.name || formData.name.trim() === "") {
      toast.error(t("ingredient.validation_name_required"));
      return;
    }

    if (!formData.unit || !formData.category) {
      toast.error(t("ingredient.validation_unit_category_required"));
      return;
    }

    try {
      setLoading(true);
      await updateIngredient({ id, data: formData });
      toast.success(t("ingredient.update_success"));
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật nguyên liệu:", err);
      toast.error(t("common.update_failed"));
    } finally {
      setLoading(false);
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
        {t("ingredient.edit_title")}
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
              label={t("ingredient.name")}
              name='name'
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label={t("common.description")}
              name='description'
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select
                label={t("ingredient.unit_type")}
                name='unitType'
                value={formData.unitType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    unitType: e.target.value,
                    unit: "",
                  }))
                }
                fullWidth
                required
              >
                <MenuItem value='weight'>{t("ingredient.unit_type_weight")}</MenuItem>
                <MenuItem value='volume'>{t("ingredient.unit_type_volume")}</MenuItem>
                <MenuItem value='count'>{t("ingredient.unit_type_count")}</MenuItem>
              </TextField>

              <TextField
                select
                label={t("ingredient.unit")}
                name='unit'
                value={formData.unit}
                onChange={handleChange}
                fullWidth
                required
              >
                {allUnits
                  .filter((u) => u.type === formData.unitType)
                  .map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>

            <TextField
              select
              label={t("ingredient.category")}
              name='category'
              value={formData.category}
              onChange={handleChange}
              fullWidth
              required
            >
              {allCategories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* <TextField
              label='Ngưỡng tồn kho cảnh báo'
              type='number'
              name='reorderLevel'
              value={formData.reorderLevel}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
            /> */}

            <TextField
              select
              label={t("common.status")}
              name='status'
              value={formData.status}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value='ACTIVE'>{t("ingredient.status_in_use")}</MenuItem>
              <MenuItem value='OUT_OF_STOCK'>{t("common.out_of_stock")}</MenuItem>
              <MenuItem value='INACTIVE'>{t("ingredient.status_inactive")}</MenuItem>
            </TextField>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3 }}>
        <Button onClick={onClose} color='error' variant='outlined'>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave} color='primary' variant='contained' disabled={loading}>
          {loading ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientEditModal;
