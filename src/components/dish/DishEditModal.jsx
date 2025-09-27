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
  Paper,
  Chip,
  Typography,
  Autocomplete,
} from "@mui/material";
import { FaTimes, FaPlus, FaMinus, FaRegImage } from "react-icons/fa";
import { getDish, updateDish } from "@/service/dish";
import { getActiveIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { getIngredientsByCategory } from "@/service/ingredient";
import { getActiveStoreToppingGroups } from "@/service/topping";
import { uploadImages } from "@/service/upload";
import { toast } from "react-toastify";

const DishEditModal = ({ open, onClose, id, storeId, onUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    ingredients: [],
    toppingGroups: [],
    status: "ACTIVE", // ACTIVE | INACTIVE | OUT_OF_STOCK
  });
  const [allCategories, setAllCategories] = useState([]);
  const [ingredientsByCategory, setIngredientsByCategory] = useState([]);
  const [allToppingGroups, setAllToppingGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load categories & toppingGroups khi mở modal
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        const res = await getActiveIngredientCategoriesByStore(storeId);
        setAllCategories(res?.data || []);
      };
      const fetchToppingGroups = async () => {
        const res = await getActiveStoreToppingGroups(storeId);
        setAllToppingGroups(res?.data || []);
      };
      fetchCategories();
      fetchToppingGroups();
    }
  }, [open, storeId]);

  // Load dish hiện tại
  useEffect(() => {
    if (open && id) {
      const fetchDish = async () => {
        try {
          const res = await getDish(id);
          if (res?.success) {
            const d = res.data;
            setFormData({
              name: d.name,
              price: d.price,
              description: d.description || "",
              status: d.status || "ACTIVE",
              ingredients:
                d.ingredients?.map((i) => ({
                  ingredient: i.ingredient,
                  quantity: i.quantity,
                })) || [],
              toppingGroups: d.toppingGroups || [],
            });
            setImage(d.image?.url || null);
          }
        } catch (err) {
          console.error("Error fetching dish:", err);
        }
      };
      fetchDish();
    }
  }, [open, id]);

  // Load nguyên liệu theo category
  useEffect(() => {
    if (!selectedCategory) return setIngredientsByCategory([]);
    const fetchIngredients = async () => {
      const res = await getIngredientsByCategory({ storeId, categoryId: selectedCategory });
      setIngredientsByCategory(res?.data || []);
    };
    fetchIngredients();
  }, [selectedCategory]);

  const addIngredient = (ingredient) => {
    if (!formData.ingredients.find((i) => i.ingredient._id === ingredient._id)) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, { ingredient, quantity: 1 }],
      }));
    }
  };

  const removeIngredient = (id) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i.ingredient._id !== id),
    }));
  };

  const updateQuantity = (id, delta) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((i) =>
        i.ingredient._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      ),
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Tên món ăn là bắt buộc");
      return;
    }
    if (formData.ingredients.length === 0) {
      toast.error("Cần chọn ít nhất 1 nguyên liệu");
      return;
    }

    try {
      setLoading(true);

      let uploadedImage = { filePath: "", url: image };
      if (image && !image.startsWith("http")) {
        const fileInput = document.getElementById("editDishImageUpload");
        if (fileInput.files.length) {
          const form = new FormData();
          form.append("file", fileInput.files[0]);
          const res = await uploadImages(form);
          uploadedImage = { filePath: res[0].filePath, url: res[0].url };
        }
      }

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        status: formData.status,
        image: uploadedImage,
        ingredients: formData.ingredients.map((i) => ({
          ingredient: i.ingredient._id,
          quantity: i.quantity,
        })),
        toppingGroupIds: formData.toppingGroups.map((t) => t._id),
      };

      await updateDish({ dishId: id, data: payload });
      toast.success("Cập nhật món ăn thành công");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("Update dish failed:", err);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        Chỉnh sửa món ăn
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField
            label='Tên món ăn'
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
          />

          <TextField
            label='Giá'
            type='number'
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
            fullWidth
            required
          />

          {/* Image Upload */}
          <Box>
            <Typography variant='subtitle1' gutterBottom>
              Hình ảnh
            </Typography>
            <Paper
              variant='outlined'
              sx={{
                width: 150,
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("editDishImageUpload").click()}
            >
              {image ? (
                <img src={image} alt='Preview' style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <FaRegImage size={32} color='#aaa' />
              )}
              <input
                type='file'
                id='editDishImageUpload'
                accept='image/*'
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </Paper>
          </Box>

          <TextField
            label='Mô tả'
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            fullWidth
            multiline
            rows={3}
          />

          {/* Chọn nguyên liệu */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              select
              label='Loại nguyên liệu'
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedIngredient("");
              }}
              sx={{ flex: 1 }}
            >
              {allCategories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label='Nguyên liệu'
              value={selectedIngredient}
              onChange={(e) => {
                const ingId = e.target.value;
                setSelectedIngredient(ingId);
                const ing = ingredientsByCategory.find((i) => i._id === ingId);
                if (ing) addIngredient(ing);
              }}
              sx={{ flex: 1 }}
              disabled={!selectedCategory}
            >
              {ingredientsByCategory.map((ing) => (
                <MenuItem key={ing._id} value={ing._id}>
                  {ing.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Danh sách nguyên liệu */}
          {formData.ingredients.length > 0 && (
            <Box className='border rounded-md space-y-1'>
              {formData.ingredients.map((i) => {
                let step = 1;
                let unitLabel = i.ingredient.unit?.name || "";
                switch (i.ingredient.unit?.type) {
                  case "weight":
                    step = 50;
                    if (!unitLabel) unitLabel = "g";
                    break;
                  case "volume":
                    step = 10;
                    if (!unitLabel) unitLabel = "ml";
                    break;
                  case "count":
                    step = 1;
                    if (!unitLabel) unitLabel = "cái";
                    break;
                  default:
                    step = 1;
                }

                return (
                  <Box
                    key={i.ingredient._id}
                    className='flex justify-between items-center py-1 px-2 bg-gray-50 rounded'
                  >
                    <span className='font-medium'>{i.ingredient.name}</span>
                    <Box className='flex items-center gap-1'>
                      <IconButton size='small' onClick={() => updateQuantity(i.ingredient._id, -step)}>
                        <FaMinus />
                      </IconButton>
                      <TextField
                        size='small'
                        type='number'
                        value={i.quantity}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setFormData((prev) => ({
                            ...prev,
                            ingredients: prev.ingredients.map((ing) =>
                              ing.ingredient._id === i.ingredient._id ? { ...ing, quantity: val } : ing
                            ),
                          }));
                        }}
                        inputProps={{ step }}
                        sx={{ width: 70, textAlign: "center" }}
                      />
                      <span>{unitLabel}</span>
                      <IconButton size='small' onClick={() => updateQuantity(i.ingredient._id, step)}>
                        <FaPlus />
                      </IconButton>
                      <IconButton size='small' color='error' onClick={() => removeIngredient(i.ingredient._id)}>
                        🗑️
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Topping groups */}
          <Autocomplete
            multiple
            options={allToppingGroups}
            getOptionLabel={(option) => option.name}
            value={formData.toppingGroups}
            onChange={(e, newValue) => setFormData((prev) => ({ ...prev, toppingGroups: newValue }))}
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
                <input type='checkbox' checked={selected} readOnly style={{ width: 16, height: 16 }} />
                {option.name}
              </li>
            )}
            renderTags={() => null}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                label='Chọn nhóm món thêm'
                placeholder='Chọn nhóm...'
                fullWidth
              />
            )}
            fullWidth
          />

          {formData.toppingGroups.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
              {formData.toppingGroups.map((option) => (
                <Chip
                  key={option._id}
                  label={option.name}
                  onDelete={() =>
                    setFormData((prev) => ({
                      ...prev,
                      toppingGroups: prev.toppingGroups.filter((t) => t._id !== option._id),
                    }))
                  }
                  size='medium'
                  sx={{
                    backgroundColor: "#fc6011",
                    color: "#fff",
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          )}

          <TextField
            select
            label='Trạng thái'
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            fullWidth
          >
            <MenuItem value='ACTIVE'>Hoạt động</MenuItem>
            <MenuItem value='INACTIVE'>Ngưng</MenuItem>
            <MenuItem value='OUT_OF_STOCK'>Hết hàng</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3 }}>
        <Button onClick={onClose} color='error' variant='outlined'>
          Hủy
        </Button>
        <Button onClick={handleSave} color='primary' variant='contained' disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DishEditModal;
