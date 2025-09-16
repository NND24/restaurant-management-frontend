"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LabelWithIcon from "@/components/LableWithIcon";
import Modal from "../Modal";
import { getAllTopping, addToppingGroupOnly } from "@/service/topping";
import Loading from "@/components/Loading";
import localStorageService from "@/utils/localStorageService";
const ToppingMenuTab = () => {
    const router = useRouter();
    const storeData = localStorage.getItem("store");
    const storeId = JSON.parse(storeData)?._id;
    const role = localStorageService.getRole();
    const blockEdit = role === "staff";
    const [toppingGroups, setToppingGroups] = useState([]);
    const [newGroups, setNewGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [search, setSearch] = useState("");

    // Fetch all topping groups only once on mount


    const fetchToppings = async () => {
        try {
            setIsLoading(true);
            const response = await getAllTopping({ storeId });
            setToppingGroups(response?.data || []);
        } catch (err) {
            console.error("Error fetching toppings:", err);
            setError("Lỗi khi tải topping");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchToppings();
    }, [storeId]);

    const handleAddGroup = async () => {
        if (!newGroupName.trim()) return;

        try {
            const newGroup = await addToppingGroupOnly({
                storeId,
                name: newGroupName,
            });
            await fetchToppings(); // Refresh the list after adding
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to add topping group:", err);
        }
    };

    // Combine from server and local new ones
    const allGroups = [...toppingGroups, ...newGroups];

    // Inline filter (case-insensitive, accent-insensitive, search by name)
    const normalized = (s) =>
        s
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    const filteredGroups = allGroups.filter(
        (g) => !search || normalized(g.name).includes(normalized(search))
    );

    if (isLoading) return <Loading />;
    if (error) return <p className="p-4 text-red-500">{error}</p>;

    return (
        <div className="w-full p-4 mb-20">
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleAddGroup}
                title="Thêm Nhóm Topping"
                confirmTitle="Lưu"
                closeTitle="Hủy"
            >
                <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Nhập tên nhóm topping"
                    className="w-full p-2 border rounded-md"
                    required
                />
            </Modal>

            <div className="flex justify-between items-center border-b pb-2 mb-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm nhóm topping..."
                    className="flex-1 border rounded-lg px-4 py-2"
                />
            </div>
            {
                !blockEdit && (
                    <div className="flex gap-3 mt-2 md:mt-0 justify-end">
                        <LabelWithIcon
                            title="Thêm nhóm"
                            iconPath="/assets/plus.png"
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>
                )
            }
            <div className="mt-6">
                {filteredGroups.length === 0 ? (
                    <p className="text-gray-500 text-center">
                        Không có nhóm topping nào phù hợp.
                    </p>
                ) : (
                    filteredGroups.map((group) => (
                        <div
                            key={group._id}
                            className="flex justify-between items-center bg-white p-3 rounded-md shadow-md cursor-pointer my-2 hover:bg-gray-100"
                            onClick={() =>
                                router.push(`menu/topping/${group._id}`)
                            }
                        >
                            <p className="font-semibold">{group.name}</p>
                            <p className="text-gray-500">
                                {group.toppings?.length || 0} toppings
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ToppingMenuTab;
