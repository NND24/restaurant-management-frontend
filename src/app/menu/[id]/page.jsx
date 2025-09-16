"use client";

import NavBar from "@/components/NavBar";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useRouter, useParams } from "next/navigation";

import {
    getDish,
    getToppingFromDish,
    updateDish as updateDishService,
    deleteDish as deleteDishService,
} from "@/service/dish";
import { getAllTopping } from "@/service/topping";
import { getAllCategories } from "@/service/category";
import localStorageService from "@/utils/localStorageService";
import { uploadImages, deleteFile } from "@/service/upload";

const Page = () => {
    const { id } = useParams();
    const router = useRouter();
    const role = localStorageService.getRole();
    const blockEdit = role === "staff";
    const [dish, setDish] = useState({});
    const [image, setImage] = useState(null);
    const [selectedToppings, setSelectedToppings] = useState(new Set());
    const [selectedCategory, setSelectedCategory] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
    });
    const [allToppings, setAllToppings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const storeData =
        typeof window !== "undefined" ? localStorage.getItem("store") : null;
    const storeId = storeData ? JSON.parse(storeData)._id : null;

    useEffect(() => {
        if (!storeId) return;

        const fetchData = async () => {
            try {
                const [dishRes, toppingRes, allToppingsRes, categoriesRes] =
                    await Promise.all([
                        getDish(id),
                        getToppingFromDish(id),
                        getAllTopping({ storeId }),
                        getAllCategories({ storeId }),
                    ]);

                const dishData = dishRes.data || {};
                const toppingList = allToppingsRes.data || [];
                const categoryList = categoriesRes.data || [];

                setDish(dishData);
                setAllToppings(toppingList);
                setCategories(categoryList);

                setImage(dishData?.image?.url || null);
                setSelectedToppings(
                    new Set(dishData.toppingGroups?.map((t) => t._id))
                );
                setSelectedCategory(dishData.category?._id || "");
                setFormData({
                    name: dishData.name || "",
                    price: dishData.price || "",
                    description: dishData.description || "",
                });
            } catch (err) {
                console.error("Failed to fetch dish details", err);
            }
        };

        fetchData();
    }, [id, storeId]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToppingToggle = (toppingId) => {
        setSelectedToppings((prev) => {
            const updatedSet = new Set(prev);
            updatedSet.has(toppingId)
                ? updatedSet.delete(toppingId)
                : updatedSet.add(toppingId);
            return updatedSet;
        });
    };

    const handleSave = () => setShowModal(true);
    const handleDelete = () => setShowDeleteModal(true); // 👈 open delete modal

    const confirmSave = async () => {
        setShowModal(false);
        let uploadedImage = { filePath: "", url: image };

        if (image && !image.startsWith("http")) {
            try {
                const fileInput = document.getElementById("imageUpload");
                if (!fileInput.files.length) return;

                const fileForm = new FormData();
                fileForm.append("file", fileInput.files[0]);

                if (dish.image?.url) {
                    await deleteFile(dish.image.url);
                }

                const uploadRes = await uploadImages(fileForm).unwrap();
                uploadedImage = {
                    filePath: uploadRes[0].filePath,
                    url: uploadRes[0].url,
                };
            } catch (error) {
                console.error("Image upload failed", error);
                return;
            }
        }

        const updatedData = {
            name: formData.name,
            price: Number(formData.price),
            description: formData.description,
            image: uploadedImage,
            toppingGroups: Array.from(selectedToppings),
            category: selectedCategory,
        };

        try {
            await updateDishService({ dishId: id, updatedData });
            router.back();
        } catch (err) {
            console.error("Update dish failed", err);
        }
    };

    const confirmDelete = async () => {
        setShowDeleteModal(false);
        try {
            console.log(dish);
            await deleteDishService({ dishId: dish._id });
            router.push("/menu");
        } catch (err) {
            console.error("Delete dish failed", err);
        }
    };

    return (
        <>
            <Header title="Chi tiết món ăn" goBack={true} />
            <div className="w-full px-5 py-6 mt-12 mb-24">
                <div className="flex-1 overflow-auto space-y-6">
                    {/* Image Upload */}
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700">
                            Hình ảnh
                        </label>
                        <div className="relative mt-3 w-24 h-24 rounded-md border flex items-center justify-center bg-gray-100">
                            {image ? (
                                <img
                                    src={image}
                                    alt="Uploaded"
                                    className="w-full h-full rounded-md object-cover"
                                />
                            ) : (
                                <span className="text-gray-400">
                                    Chưa có ảnh
                                </span>
                            )}
                            <input
                                type="file"
                                id="imageUpload"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                ondisabled={blockEdit}
                            />
                            {!blockEdit && (
                                <button
                                    onClick={() =>
                                        document
                                            .getElementById("imageUpload")
                                            .click()
                                    }
                                    className="absolute top-1 right-1 bg-gray-700 text-white text-xs px-2 py-1 rounded-md shadow-md hover:bg-gray-900 transition"
                                >
                                    Sửa
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                        {[
                            { label: "Tên*", name: "name", type: "text" },
                            { label: "Giá*", name: "price", type: "number" },
                            {
                                label: "Mô tả",
                                name: "description",
                                type: "text",
                            },
                        ].map((field, i) => (
                            <div key={i} className="border-b pb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    disabled={blockEdit}
                                    className="w-full p-2 ring-1 ring-gray-300 my-2 rounded-md outline-none focus:ring-[#fc6011]"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Category Select */}
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700">
                            Danh mục*
                        </label>
                        <select
                            value={selectedCategory}
                            disabled={blockEdit}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="w-full p-2 ring-1 ring-gray-300 my-2 rounded-md outline-none focus:ring-[#fc6011]"
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Toppings */}
                    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Topping của cửa hàng
                        </h3>
                        {allToppings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {allToppings.map((topping) => (
                                    <label
                                        key={topping._id}
                                        className="flex items-center gap-3 p-2 border rounded-md shadow-sm hover:bg-gray-100"
                                    >
                                        <input
                                            disabled={blockEdit}
                                            type="checkbox"
                                            checked={selectedToppings.has(
                                                topping._id
                                            )}
                                            onChange={() =>
                                                handleToppingToggle(topping._id)
                                            }
                                        />
                                        {topping.name}
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                Không có topping nào
                            </p>
                        )}
                    </div>
                    {!blockEdit && (
                        <div className="flex justify-end w-full items-center">
                            <button
                                onClick={handleDelete}
                                className="text-white p-3 px-10 text-md font-semibold rounded-lg bg-red-600"
                            >
                                Xóa
                            </button>
                            <button
                                onClick={handleSave}
                                className="text-white p-3 px-10 text-md font-semibold rounded-lg bg-[#fc6011] ml-6"
                            >
                                Lưu
                            </button>
                        </div>
                    )}
                    {/* Action Buttons */}

                    {/* Save Modal */}
                    {showModal && (
                        <div
                            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                            onClick={() => setShowModal(false)}
                        >
                            <div
                                className="bg-white p-5 rounded-lg shadow-lg p-10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p>Bạn có chắc chắn muốn lưu?</p>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="bg-gray-400 text-white px-4 py-2 rounded"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        onClick={confirmSave}
                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Modal */}
                    {showDeleteModal && (
                        <div
                            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            <div
                                className="bg-white p-5 rounded-lg shadow-lg p-10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p>
                                    Bạn có chắc chắn muốn <strong>xóa</strong>{" "}
                                    món ăn này?
                                </p>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="bg-gray-400 text-white px-4 py-2 rounded"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="bg-red-600 text-white px-4 py-2 rounded"
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <NavBar page="" />
        </>
    );
};

export default Page;
