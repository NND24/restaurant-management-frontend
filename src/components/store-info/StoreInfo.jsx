"use client";
import { Autocomplete, Chip, Paper, TextField, Box } from "@mui/material";
import React, { useState } from "react";
import { FaPen, FaCheck, FaTimes } from "react-icons/fa";

const StoreInfo = ({ storeInfo, categories, onUpdateInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(storeInfo.name);
  const [tempDesc, setTempDesc] = useState(storeInfo.description);
  const [tempCats, setTempCats] = useState(storeInfo.storeCategory || []);

  const toggleCategory = (categoryId) => {
    const isChecked = tempCats.some((c) => c._id === categoryId);
    const updated = isChecked
      ? tempCats.filter((c) => c._id !== categoryId)
      : [...tempCats, categories.find((c) => c._id === categoryId)];
    setTempCats(updated);
  };

  const handleSave = () => {
    const updatedData = {
      name: tempName,
      description: tempDesc,
      storeCategory: tempCats.map((c) => c._id),
    };
    onUpdateInfo(updatedData); // callback từ page.jsx
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(storeInfo.name);
    setTempDesc(storeInfo.description);
    setTempCats(storeInfo.storeCategory || []);
    setIsEditing(false);
  };

  return (
    <div className='mx-auto max-w-full space-y-6 rounded-xl bg-white p-6 shadow-md'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-800'>Thông tin cửa hàng</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className='text-orange-600 hover:text-orange-800'
            title='Chỉnh sửa'
          >
            <FaPen />
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        <div>
          <label className='w-1/3 font-semibold text-gray-700'>Tên cửa hàng</label>
          <input
            type='text'
            className='w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none'
            value={tempName}
            readOnly={!isEditing}
            onChange={(e) => setTempName(e.target.value)}
          />
        </div>

        <div>
          <label className='w-1/3 font-semibold text-gray-700'>Mô tả</label>
          <textarea
            className='h-[100px] w-full resize-none rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none'
            value={tempDesc}
            readOnly={!isEditing}
            onChange={(e) => setTempDesc(e.target.value)}
          />
        </div>

        <div className='md:col-span-2'>
          <label className='w-1/3 font-semibold text-gray-700'>Danh mục cửa hàng</label>

          {isEditing ? (
            <>
              <Autocomplete
                multiple
                options={categories}
                getOptionLabel={(option) => option.name}
                value={tempCats}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                onChange={(e, newValue) => setTempCats(newValue)}
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
                  <TextField {...params} variant='outlined' label='Chọn danh mục' placeholder='Chọn...' fullWidth />
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

              {/* Chip list */}
              {tempCats.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                  {tempCats.map((cat) => (
                    <Chip
                      key={cat._id}
                      label={cat.name}
                      onDelete={() => setTempCats((prev) => prev.filter((c) => c._id !== cat._id))}
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
            </>
          ) : (
            <div className='flex flex-wrap gap-2 mt-2'>
              {tempCats.map((cat) => (
                <Chip
                  key={cat._id}
                  label={cat.name}
                  size='small'
                  sx={{
                    backgroundColor: "#fc6011",
                    color: "#fff",
                    fontWeight: 500,
                    borderRadius: "16px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className='flex justify-end gap-4 mt-2'>
          <button className='text-green-600 hover:text-green-800' onClick={handleSave} title='Lưu'>
            <FaCheck />
          </button>
          <button className='text-red-600 hover:text-red-800' onClick={handleCancel} title='Hủy'>
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreInfo;
