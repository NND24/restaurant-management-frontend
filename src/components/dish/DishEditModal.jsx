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
  CircularProgress,
} from "@mui/material";
import { FaTimes, FaPlus, FaMinus, FaRegImage } from "react-icons/fa";
import { getDish, updateDish } from "@/service/dish";
import { getActiveIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { getIngredientsByCategory } from "@/service/ingredient";
import { getActiveStoreToppingGroups } from "@/service/topping";
import { uploadImages } from "@/service/upload";
import { toast } from "react-toastify";
import { getSystemCategoryByStoreId } from "@/service/systemCategory";
import { urlToFile } from "@/utils/functions";
import axios from "axios";

const API_IMAGE = "http://localhost:8000/generate-caption-from-image";

const generateCaptionFromFile = async (formData) => {
  try {
    const res = await axios.post(API_IMAGE, formData);
    return res.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const DishEditModal = ({ open, onClose, id, storeId, onUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    ingredients: [],
    toppingGroups: [],
    category: "",
    image: null,
    status: "ACTIVE",
  });

  const [allCategories, setAllCategories] = useState([]);
  const [ingredientsByCategory, setIngredientsByCategory] = useState([]);
  const [allToppingGroups, setAllToppingGroups] = useState([]);
  const [allSystemCategories, setAllSystemCategories] = useState([]); // ✅ thêm
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ✅ Load dữ liệu khi mở modal
  useEffect(() => {
    if (open) {
      const fetchAll = async () => {
        setIsLoadingData(true);
        try {
          const [resIngCat, resTopping, resSysCat] = await Promise.all([
            getActiveIngredientCategoriesByStore(storeId),
            getActiveStoreToppingGroups(storeId),
            getSystemCategoryByStoreId(storeId),
          ]);
          setAllCategories(resIngCat?.data || []);
          setAllToppingGroups(resTopping?.data || []);
          setAllSystemCategories(resSysCat?.data || []);
        } catch (err) {
          console.error("Failed to load categories:", err);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchAll();
    }
  }, [open, storeId]);

  // ✅ Load món ăn hiện tại
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
              image: d.image?.url || null,
              description: d.description || "",
              status: d.status || "ACTIVE",
              category: d.category?._id || "", // ✅ load category hiện tại
              ingredients:
                d.ingredients?.map((i) => ({
                  ingredient: i.ingredient,
                  quantity: i.quantity,
                })) || [],
              toppingGroups: d.toppingGroups || [],
            });
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const toastId = toast.loading("Đang xử lý ảnh...", { autoClose: false });
    setFormData((prev) => ({ ...prev, image: file }));

    try {
      toast.update(toastId, {
        render: "Đang tải ảnh lên...",
        type: "info",
        isLoading: true,
      });

      const uploadRes = await uploadImages(form);

      if (!uploadRes || !uploadRes[0]?.url) {
        throw new Error("Tải ảnh lên server lưu trữ thất bại");
      }

      toast.update(toastId, {
        render: "Tải ảnh hoàn tất!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (err) {
      console.error(err);
      let errorMessage = "Không thể xử lý ảnh.";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.update(toastId, {
        render: `Lỗi xử lý: ${errorMessage}`,
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });

      setFormData((prev) => ({ ...prev, image: null }));
    }
  };

  const reGenerateCaptionFromFile = async () => {
    const toastId = toast.loading("Đang xử lý ảnh...", { autoClose: false });
    try {
      toast.update(toastId, {
        render: "Đang tạo mô tả món ăn...",
        type: "info",
        isLoading: true,
      });
      const form = new FormData();
      form.append(formData.image instanceof File ? "file" : "image_url", formData.image);
      form.append(
        "ingredients",
        formData.ingredients.map((i) => i.ingredient.name)
      );
      const res = await generateCaptionFromFile(form);
      setFormData((prev) => ({ ...prev, description: res.caption }));
      toast.update(toastId, {
        render: "Đã tạo mô tả thành công!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (err) {
      console.error(err);
      let errorMessage = "Không thể xử lý ảnh.";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.update(toastId, {
        render: `Lỗi xử lý: ${errorMessage}`,
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });
    }
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
    if (!formData.category) {
      toast.error("Vui lòng chọn loại món ăn");
      return;
    }

    try {
      setLoading(true);

      let uploadedImage = typeof formData.image === "string" ? { filePath: "", url: formData.image } : null;

      // 👉 CHỈ upload khi là File
      if (formData.image instanceof File) {
        const form = new FormData();
        form.append("file", formData.image);

        const res = await uploadImages(form);

        uploadedImage = {
          filePath: res[0].filePath,
          url: res[0].url,
        };
      }

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        status: formData.status,
        image: uploadedImage,
        category: formData.category, // ✅ gửi category
        ingredients: formData.ingredients.map((i) => ({
          ingredient: i.ingredient._id,
          quantity: i.quantity,
        })),
        toppingGroups: formData.toppingGroups.map((t) => t._id),
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
        {isLoadingData ? (
          <Box className='flex justify-center items-center h-40'>
            <CircularProgress color='warning' />
          </Box>
        ) : (
          <Box display='flex' gap={4}>
            <Box sx={{ flex: 1 }}>
              {/* Hình ảnh */}
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Hình ảnh
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
                  onClick={() => document.getElementById("editDishImageUpload").click()}
                >
                  {formData.image ? (
                    <img
                      src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image}
                      alt='Preview'
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: 150,
                        objectFit: "cover",
                      }}
                    />
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
            </Box>
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                fullWidth
                required
              />

              {/* ✅ Chọn loại món ăn */}
              <TextField
                select
                label='Loại món ăn'
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

              {/* Mô tả */}
              <Box>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Typography variant='subtitle1'>Mô tả món ăn (AI gợi ý - có thể chỉnh sửa)</Typography>

                  {formData.description && (
                    <Button onClick={reGenerateCaptionFromFile} size='small' variant='outlined'>
                      Mô tả khác
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

export default DishEditModal;
