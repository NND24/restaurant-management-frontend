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
} from "@mui/material";
import { FaRegImage, FaTimes } from "react-icons/fa";
import { createDish } from "@/service/dish";
import { getAllTopping } from "@/service/topping";
import { getDishCategories } from "@/service/dishCategory";
import { uploadImages } from "@/service/upload";

const DishCreateModal = ({ open, onClose, storeId, onCreated }) => {
  const [allToppings, setAllToppings] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const [toppingRes, categoryRes] = await Promise.all([getAllTopping({ storeId }), getDishCategories({ storeId })]);
      setAllToppings(toppingRes?.data || []);
      setAllCategories(categoryRes?.data || []);
    };
    fetchInitialData();
  }, [storeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    let uploadedImage = { filePath: "", url: image };

    if (image && !image.startsWith("http")) {
      const fileInput = document.getElementById("imageUpload");
      if (fileInput.files.length) {
        const form = new FormData();
        form.append("file", fileInput.files[0]);
        const res = await uploadImages(form);
        uploadedImage = { filePath: res[0].filePath, url: res[0].url };
      }
    }

    const newDish = {
      ...formData,
      price: Number(formData.price),
      image: uploadedImage,
      toppingGroups: selectedToppings.map((t) => t._id),
    };

    await createDish({ storeId, dishData: newDish });
    onCreated?.();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        Thêm món ăn
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
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
              onClick={() => document.getElementById("imageUpload").click()}
            >
              {image ? (
                <img src={image} alt='Preview' style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

          {/* Form Fields */}
          <Box display='flex' gap={2} flexWrap='wrap'>
            <TextField label='Tên*' name='name' value={formData.name} onChange={handleChange} fullWidth />
            <TextField
              label='Giá*'
              name='price'
              type='number'
              value={formData.price}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <TextField
            label='Mô tả'
            name='description'
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          <TextField
            select
            label='Danh mục*'
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            fullWidth
            variant='outlined'
          >
            {allCategories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Toppings */}
          <Box>
            <Autocomplete
              multiple
              options={allToppings}
              getOptionLabel={(option) => option.name}
              value={selectedToppings}
              onChange={(e, newValue) => setSelectedToppings(newValue)}
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
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#fc6011",
                    }}
                  />
                  {option.name}
                </li>
              )}
              renderTags={() => null} // ✅ ẩn chip mặc định trong input
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='outlined'
                  label='Toppings'
                  placeholder='Chọn topping...'
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      minHeight: 48,
                      padding: "4px 8px",
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ddd" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#fc6011" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#fc6011", borderWidth: 2 },
                    },
                  }}
                />
              )}
              PaperComponent={({ children }) => (
                <Paper
                  elevation={3}
                  sx={{
                    maxHeight: 240,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: "#fc6011", borderRadius: 3 },
                  }}
                >
                  {children}
                </Paper>
              )}
              fullWidth
            />

            {/* Chip list hiển thị riêng dưới input */}
            {selectedToppings.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                {selectedToppings.map((option, index) => (
                  <Chip
                    key={option._id}
                    label={option.name}
                    onDelete={() => setSelectedToppings((prev) => prev.filter((t) => t._id !== option._id))}
                    size='medium'
                    sx={{
                      backgroundColor: "#fc6011",
                      color: "#fff",
                      fontWeight: 500,
                      borderRadius: "16px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                      "&:hover": { backgroundColor: "#e5550f" },
                      "& .MuiChip-deleteIcon": { color: "#fff", "&:hover": { color: "#ffdbb3" } },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='secondary' variant='outlined'>
          Hủy
        </Button>
        <Button onClick={handleSave} color='primary' variant='contained'>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DishCreateModal;
