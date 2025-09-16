"use client";

import React, { useEffect, useState } from "react";
import { getAllDish, toggleSaleStatus } from "@/service/dish";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loading from "../../components/Loading";
import LabelWithIcon from "../../components/LableWithIcon";
import localStorageService from "@/utils/localStorageService";
const DishMenuTab = () => {
    const router = useRouter();
    const getRole = localStorageService.getRole();
    const blockEdit = getRole === "staff";
    const storeData =
        typeof window !== "undefined" && localStorage.getItem("store");
    const storeId = storeData ? JSON.parse(storeData)?._id : "";

    const [allDishes, setAllDishes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    // Fetch all dishes on mount (only once)
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const dishData = await getAllDish(storeId);
                const list = dishData?.data?.data || dishData?.data || [];
                setAllDishes(list);
            } catch (err) {
                console.error("Failed to fetch dishes", err);
                setError("Lỗi tải danh sách món");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [storeId]);

    // Accent-insensitive, case-insensitive search for dish name or category
    function normalize(str = "") {
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    // Browser search filter (by dish name or category name)
    const filteredDishes = allDishes.filter((dish) => {
        if (!search) return true;
        const dishName = normalize(dish.name);
        const catName = normalize(dish.category?.name || "Khác");
        const s = normalize(search);
        return dishName.includes(s) || catName.includes(s);
    });

    // Group by category
    const grouped = {};
    filteredDishes.forEach((dish) => {
        const cat = dish.category?.name || "Khác";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(dish);
    });

    const menu = Object.entries(grouped).map(([category, items]) => ({
        category,
        items,
    }));

    // Toggle available status
    const toggleItemEnabled = async (id) => {
        try {
            await toggleSaleStatus({ dishId: id });
            setAllDishes((prevDishes) =>
                prevDishes.map((item) =>
                    item._id === id
                        ? {
                              ...item,
                              stockStatus:
                                  item.stockStatus === "AVAILABLE"
                                      ? "OUT_OF_STOCK"
                                      : "AVAILABLE",
                          }
                        : item
                )
            );
        } catch (err) {
            console.error("Failed to toggle sale status", err);
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

    return (
        <div className="w-full p-4 mb-20">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 border-b pb-2 mb-2">
                <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="Tìm món ăn hoặc danh mục..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {!blockEdit && (
                <div className="flex gap-3 mt-2 md:mt-0 justify-end">
                    <LabelWithIcon
                        title="Thêm"
                        iconPath="/assets/plus.png"
                        onClick={() => router.push("menu/add")}
                    />
                    <LabelWithIcon
                        title="Chỉnh sửa danh mục"
                        iconPath="/assets/editing.png"
                        onClick={() => router.push("menu/category")}
                    />
                </div>
            )}

            {menu.length === 0 && (
                <div className="text-center text-gray-500 italic py-10">
                    Không có món ăn nào phù hợp.
                </div>
            )}

            {menu.map((section) => (
                <div key={section.category} className="mt-6">
                    <h3 className="font-bold text-xl mb-2">
                        {section.category}
                    </h3>
                    <div className="bg-gray-100 rounded-md p-2">
                        {section.items.length === 0 ? (
                            <div className="text-sm text-gray-500 italic p-3">
                                Không có món nào.
                            </div>
                        ) : (
                            section.items.map((item) => (
                                <DishMenuRow
                                    key={item._id}
                                    item={item}
                                    router={router}
                                    toggleItemEnabled={toggleItemEnabled}
                                />
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const DishMenuRow = ({ item, router, toggleItemEnabled }) => (
    <div
        className="flex items-center justify-between bg-white p-3 rounded-md shadow-md my-2 cursor-pointer hover:bg-gray-50"
        onClick={() => router.push(`menu/${item._id}`)}
    >
        <div className="flex items-center space-x-3">
            <Image
                src={item.image?.url || "/assets/no-pictures.png"}
                alt={item.name}
                width={40}
                height={40}
                className="rounded-md"
            />
            <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                    {item.price?.toLocaleString() || 0}₫
                </p>
            </div>
        </div>
        <label
            className="inline-flex items-center cursor-pointer"
            onClick={(e) => e.stopPropagation()}
        >
            <input
                type="checkbox"
                className="sr-only peer"
                checked={item.stockStatus === "AVAILABLE"}
                onChange={() => toggleItemEnabled(item._id)}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"></div>
        </label>
    </div>
);

export default DishMenuTab;
