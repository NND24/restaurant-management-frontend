"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Box,
  Paper,
  Typography,
  IconButton,
  MenuItem,
  Switch,
} from "@mui/material";
import { FaMinus, FaPlus, FaRegImage, FaTimes } from "react-icons/fa";
import { createDish } from "@/service/dish";
import { getActiveStoreToppingGroups } from "@/service/topping";
import { uploadImages } from "@/service/upload";
import { getIngredientsByCategory } from "@/service/ingredient";
import { getActiveIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { generateImageDescription } from "@/service/huggingface";
import { toast } from "react-toastify";
import { improveVietnameseDescription } from "@/service/statistic";
import { getSystemCategoryByStoreId } from "@/service/systemCategory";
import axios from "axios";
import { useTranslation } from "react-i18next";

const DishCreateModal = ({ open, onClose, storeId, onCreated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    image: null,
    description: "",
    ingredients: [],
    toppingGroups: [],
    category: null,
    status: "ACTIVE", // ACTIVE | INACTIVE | OUT_OF_STOCK
  });
  const [allCategories, setAllCategories] = useState([]);
  const [allToppingGroups, setAllToppingGroups] = useState([]);
  const [ingredientsByCategory, setIngredientsByCategory] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allSystemCategories, setAllSystemCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoDescribe, setAutoDescribe] = useState(true);

  // 🔹 Dùng cho AI caption từ FoodCaptioner
  const API_IMAGE = "http://localhost:8000/generate-caption-from-image";

  // 🟦 Tạo mô tả từ FILE
  const generateCaptionFromFile = async (formData) => {
    try {
      const res = await axios.post(API_IMAGE, formData);
      return res.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        price: 0,
        image: null,
        description: "",
        status: "ACTIVE",
        ingredients: [],
        toppingGroups: [],
      });
      const fetchCategories = async () => {
        const res = await getActiveIngredientCategoriesByStore(storeId);
        setAllCategories(res?.data || []);
      };
      fetchCategories();

      const fetchToppingGroups = async () => {
        try {
          const res = await getActiveStoreToppingGroups(storeId);
          setAllToppingGroups(res?.data || []);
        } catch (err) {
          console.error("Failed to load toppingGroups", err);
        }
      };
      fetchToppingGroups();

      const fetchSystemCategories = async () => {
        try {
          const res = await getSystemCategoryByStoreId(storeId);
          setAllSystemCategories(res?.data || []);
        } catch (err) {
          console.error("Failed to load system categories", err);
        }
      };
      fetchSystemCategories();

      setSelectedCategory("");
      setIngredientsByCategory([]);
    }
  }, [open, storeId]);

  useEffect(() => {
    if (!selectedCategory) return setIngredientsByCategory([]);
    const fetchIngredients = async () => {
      const res = await getIngredientsByCategory({
        storeId,
        categoryId: selectedCategory,
      });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading(t("dish.processing_image"), { autoClose: false });

    setFormData((prev) => ({ ...prev, image: file }));

    const form = new FormData();
    form.append("file", file);

    const ingredientsArray = formData.ingredients.map((i) => i.ingredient.name);
    form.append("ingredients", ingredientsArray.join(","));

    try {
      let successMessage = t("dish.image_processing_done");

      toast.update(toastId, {
        render: t("dish.uploading_image"),
        type: "info",
        isLoading: true,
      });

      const uploadRes = await uploadImages(form);

      if (!uploadRes || !uploadRes[0]?.url) {
        throw new Error(t("dish.upload_failed"));
      }

      if (autoDescribe) {
        toast.update(toastId, {
          render: t("dish.generating_description"),
          type: "info",
          isLoading: true,
        });

        const captionRes = await generateCaptionFromFile(form);

        if (captionRes && captionRes.caption) {
          setFormData((prev) => ({
            ...prev,
            description: captionRes.caption,
          }));
          successMessage = t("dish.upload_and_description_success");
        } else {
          console.warn("Tạo mô tả AI thất bại hoặc không có dữ liệu mô tả.");
          successMessage = t("dish.upload_success_no_description");
        }
      } else {
        successMessage = t("dish.image_upload_done");
      }

      toast.update(toastId, {
        render: successMessage,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (err) {
      console.error(err);
      let errorMessage = t("dish.image_process_error");

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.update(toastId, {
        render: `${t("dish.process_error_prefix")}: ${errorMessage}`,
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });

      setFormData((prev) => ({ ...prev, image: null }));
    }
  };

  const reGenerateCaptionFromFile = async () => {
    const toastId = toast.loading(t("dish.processing_image"), { autoClose: false });
    try {
      toast.update(toastId, {
        render: t("dish.generating_dish_description"),
        type: "info",
        isLoading: true,
      });
      const form = new FormData();
      form.append("file", formData.image);
      form.append(
        "ingredients",
        formData.ingredients.map((i) => i.ingredient.name)
      );
      const res = await generateCaptionFromFile(form);
      setFormData((prev) => ({ ...prev, description: res.caption }));
      toast.update(toastId, {
        render: t("dish.description_generated_success"),
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (err) {
      console.error(err);
      let errorMessage = t("dish.image_process_error");

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.update(toastId, {
        render: `${t("dish.process_error_prefix")}: ${errorMessage}`,
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });
    }
  };

  const handleSave = async () => {
    let uploadedImage = { filePath: "", url: formData.image };

    if (formData.image) {
      const form = new FormData();
      form.append("file", formData.image);
      const res = await uploadImages(form);
      uploadedImage = { filePath: res[0].filePath, url: res[0].url };
    }

    if (formData.price === 0) {
      toast.error(t("dish.validation_price_required"));
      return;
    }

    if (!formData.name.trim()) {
      toast.error(t("dish.validation_name_required"));
      return;
    }

    if (formData.ingredients.length === 0) {
      toast.error(t("dish.validation_ingredient_required"));
      return;
    }

    if (!formData.category) {
      toast.error(t("dish.validation_category_required"));
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        image: uploadedImage,
        ingredients: formData.ingredients.map((i) => ({
          ingredient: i.ingredient._id,
          quantity: i.quantity,
        })),
        toppingGroups: formData.toppingGroups.map((t) => t._id),
        status: formData.status,
        category: formData.category,
      };

      await createDish({ storeId, data: payload });
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(t("dish.add_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        {t("dish.add_title")}
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display='flex' gap={4}>
          <Box>
            {/* Image Upload */}
            <Box>
              <Typography variant='subtitle1' gutterBottom>
                {t("common.image")}
              </Typography>
              <Paper
                variant='outlined'
                sx={{
                  maxWidth: 300,
                  minHeight: 150,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("imageUpload").click()}
              >
                {formData.image ? (
                  <img
                    src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image}
                    alt='Preview'
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <FaRegImage size={32} color='#aaa' />
                )}
                <input
                  type='file'
                  id='imageUpload'
                  accept='image/*'
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
              </Paper>
            </Box>

            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='subtitle1'>{t("dish.auto_describe_toggle")}</Typography>
              <Switch checked={autoDescribe} onChange={(e) => setAutoDescribe(e.target.checked)} color='primary' />
            </Box>
          </Box>
          <Box className='space-y-4 flex-1'>
            {/* Form Fields */}
            <Box display='flex' gap={2} flexWrap='wrap'>
              <TextField label={t("dish.name_required")} name='name' value={formData.name} onChange={handleChange} fullWidth />
              <TextField
                label={t("dish.price_required")}
                name='price'
                type='number'
                value={formData.price}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            <TextField
              select
              label={t("dish.category")}
              value={formData.category || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              fullWidth
            >
              {allSystemCategories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {/* Select loại nguyên liệu */}
              <TextField
                select
                label={t("dish.ingredient_category")}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedIngredient(""); // reset khi đổi loại
                }}
                sx={{ flex: 1 }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 200, // chiều cao tối đa (có scroll)
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

              {/* Select nguyên liệu theo loại */}
              <TextField
                select
                label={t("dish.ingredient")}
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
                        maxHeight: 200, // chiều cao tối đa (có scroll)
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

            {/* Nguyên liệu đã chọn */}
            {formData.ingredients.length > 0 && (
              <Box className='border rounded-md space-y-1'>
                {formData.ingredients.map((i) => {
                  // Xác định bước tăng/giảm theo loại unit
                  let step = 1;
                  let unitLabel = i.ingredient.unit?.name || "";

                  switch (i.ingredient.unit?.type) {
                    case "weight":
                      step = 50; // 50g
                      if (!unitLabel) unitLabel = "g";
                      break;
                    case "volume":
                      step = 10; // 10ml
                      if (!unitLabel) unitLabel = "ml";
                      break;
                    case "count":
                      step = 1; // 1 cái
                      if (!unitLabel) unitLabel = t("dish.unit_piece");
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

                        {/* Input để chỉnh số lượng trực tiếp */}
                        <TextField
                          size='small'
                          type='number'
                          value={i.quantity}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value)); // không cho âm
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

            <Box>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography variant='subtitle1'>{t("dish.description_ai_hint")}</Typography>

                {formData.description && (
                  <Button onClick={reGenerateCaptionFromFile} size='small' variant='outlined'>
                    {t("dish.other_description")}
                  </Button>
                )}
              </Box>

              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
                rows={6}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 15,
                  fontFamily: "inherit",
                  background: "#fafafa",
                }}
              />
            </Box>

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
                  <input
                    type='checkbox'
                    checked={selected}
                    readOnly
                    style={{ width: 16, height: 16, accentColor: "#fc6011" }}
                  />
                  {option.name}
                </li>
              )}
              renderTags={() => null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='outlined'
                  label={t("dish.topping_group_label")}
                  placeholder={t("dish.topping_group_placeholder")}
                  fullWidth
                />
              )}
              PaperComponent={({ children }) => (
                <Paper
                  elevation={3}
                  sx={{
                    maxHeight: 240,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#fc6011",
                      borderRadius: 3,
                    },
                  }}
                >
                  {children}
                </Paper>
              )}
              fullWidth
            />

            {/* Chip list hiển thị riêng dưới input */}
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
                      borderRadius: "16px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                  />
                ))}
              </Box>
            )}

            <TextField
              select
              label={t("common.status")}
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              fullWidth
            >
              <MenuItem value='ACTIVE'>{t("common.active")}</MenuItem>
              <MenuItem value='INACTIVE'>{t("common.inactive")}</MenuItem>
              <MenuItem value='OUT_OF_STOCK'>{t("common.out_of_stock")}</MenuItem>
            </TextField>
          </Box>
        </Box>
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

export default DishCreateModal;
