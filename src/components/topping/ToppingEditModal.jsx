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
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import { getToppingById, updateTopping } from "@/service/topping";
import { getActiveIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { getIngredientsByCategory } from "@/service/ingredient";
import { toast } from "react-toastify";

const ToppingEditModal = ({ open, onClose, id, storeId, onUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    ingredients: [],
    status: "ACTIVE", // ACTIVE | INACTIVE | OUT_OF_STOCK
  });

  const [allCategories, setAllCategories] = useState([]);
  const [ingredientsByCategory, setIngredientsByCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load categories khi mở modal
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        const res = await getActiveIngredientCategoriesByStore(storeId);
        setAllCategories(res?.data || []);
      };
      fetchCategories();
    }
  }, [open, storeId]);

  // Load topping hiện tại
  useEffect(() => {
    if (open && id) {
      const fetchTopping = async () => {
        setIsLoadingData(true);
        try {
          const res = await getToppingById(id);
          if (res?.success) {
            setFormData({
              name: res.data.name,
              price: res.data.price,
              status: res.data.status || "ACTIVE",
              ingredients:
                res.data.ingredients?.map((i) => ({
                  ingredient: i.ingredient, // đã populate ingredient
                  quantity: i.quantity,
                })) || [],
            });
          }
        } catch (err) {
          console.error("Error fetching topping:", err);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchTopping();
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

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Tên món thêm là bắt buộc");
      return;
    }
    if (formData.ingredients.length === 0) {
      toast.error("Cần chọn ít nhất 1 nguyên liệu");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        price: formData.price,
        status: formData.status,
        ingredients: formData.ingredients.map((i) => ({
          ingredient: i.ingredient._id,
          quantity: i.quantity,
        })),
      };
      await updateTopping({ toppingId: id, data: payload });
      toast.success("Cập nhật món phụ thành công");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("Update topping failed:", err);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        Chỉnh sửa món thêm
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
              label='Tên món thêm'
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
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                      },
                    },
                  },
                }}
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
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                      },
                    },
                  },
                }}
                disabled={!selectedCategory}
              >
                {ingredientsByCategory.map((ing) => (
                  <MenuItem key={ing._id} value={ing._id}>
                    {ing.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

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
        )}
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

export default ToppingEditModal;
