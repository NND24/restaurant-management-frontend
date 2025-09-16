"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Modal from "@/components/Modal";
import LabelWithIcon from "@/components/LableWithIcon";
import {
    getTopping,
    addToppingToGroup,
    removeToppingFromGroup,
    updateTopping,
    removeToppingGroup,
} from "@/service/topping";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import localStorageService from "@/utils/localStorageService";
const Page = () => {
    const { id: groupId } = useParams();
    const router = useRouter();
    const role = localStorageService.getRole();
    const blockEdit = role === "staff";
    const [toppingGroup, setToppingGroup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddToppingModalOpen, setIsAddToppingModalOpen] = useState(false);
    const [isDeleteToppingModalOpen, setIsDeleteToppingModalOpen] =
        useState(false);
    const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);

    // States for topping edit/add/delete
    const [selectedTopping, setSelectedTopping] = useState(null);
    const [newToppingName, setNewToppingName] = useState("");
    const [newToppingPrice, setNewToppingPrice] = useState("");
    const [toppingToDeleteId, setToppingToDeleteId] = useState(null);

    // Fetch topping group data
    const fetchToppings = async () => {
        try {
            setIsLoading(true);
            const res = await getTopping({ groupId });
            setToppingGroup(res?.data);
        } catch (err) {
            setError("Lỗi khi tải dữ liệu topping");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) fetchToppings();
    }, [groupId]);

    // ----- Topping Edit/Add Logic -----
    const openEditModal = (topping) => {
        setSelectedTopping(topping);
        setNewToppingName(topping.name);
        setNewToppingPrice(topping.price.toString());
        setIsEditModalOpen(true);
    };

    const handleUpdateTopping = async () => {
        if (
            !selectedTopping ||
            !newToppingName.trim() ||
            !newToppingPrice.trim()
        )
            return;
        try {
            await updateTopping({
                groupId,
                toppingId: selectedTopping._id,
                name: newToppingName,
                price: parseFloat(newToppingPrice),
            });
            setIsEditModalOpen(false);
            await fetchToppings();
            toast.success("Cập nhật topping thành công!");
        } catch {
            toast.error("Lỗi khi cập nhật topping!");
        }
    };

    // ----- Add Topping Logic -----
    const handleAddTopping = async () => {
        if (!newToppingName.trim() || !newToppingPrice.trim()) return;
        try {
            await addToppingToGroup({
                groupId,
                name: newToppingName,
                price: parseFloat(newToppingPrice),
            });
            setIsAddToppingModalOpen(false);
            setNewToppingName("");
            setNewToppingPrice("");
            await fetchToppings();
            toast.success("Thêm topping thành công!");
        } catch {
            toast.error("Lỗi khi thêm topping!");
        }
    };

    // ----- Delete Topping Logic -----
    const confirmDeleteTopping = (toppingId) => {
        setToppingToDeleteId(toppingId);
        setIsDeleteToppingModalOpen(true);
    };

    const handleRemoveTopping = async () => {
        try {
            await removeToppingFromGroup({
                groupId,
                toppingId: toppingToDeleteId,
            });
            setIsDeleteToppingModalOpen(false);
            setToppingToDeleteId(null);
            await fetchToppings();
            toast.success("Xóa topping thành công!");
        } catch {
            toast.error("Lỗi khi xóa topping!");
        }
    };

    // ----- Delete Group Logic -----
    const handleDeleteToppingGroup = async () => {
        setIsDeleteGroupModalOpen(true);
    };

    const handleConfirmDeleteGroup = async () => {
        try {
            await removeToppingGroup({ groupId });
            toast.success("Xóa nhóm topping thành công!");
            setIsDeleteGroupModalOpen(false);
            router.push("/menu");
        } catch {
            toast.error("Đã xảy ra lỗi khi xóa nhóm topping!");
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <>
            <ToastContainer position="top-right" autoClose={2000} />

            {/* Edit Topping Modal */}
            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onConfirm={handleUpdateTopping}
                title="Chỉnh sửa Topping"
                confirmTitle="Lưu"
                closeTitle="Hủy"
            >
                <input
                    type="text"
                    value={newToppingName}
                    onChange={(e) => setNewToppingName(e.target.value)}
                    placeholder="Nhập tên mới"
                    className="w-full p-2 border rounded-md mb-4"
                    required
                />
                <input
                    type="number"
                    value={newToppingPrice}
                    onChange={(e) => setNewToppingPrice(e.target.value)}
                    placeholder="Nhập giá mới"
                    min={0}
                    className="w-full p-2 border rounded-md"
                    required
                />
            </Modal>

            {/* Add New Topping Modal */}
            <Modal
                open={isAddToppingModalOpen}
                onClose={() => setIsAddToppingModalOpen(false)}
                onConfirm={handleAddTopping}
                title="Thêm Topping Mới"
                confirmTitle="Thêm"
                closeTitle="Hủy"
            >
                <input
                    type="text"
                    value={newToppingName}
                    onChange={(e) => setNewToppingName(e.target.value)}
                    placeholder="Nhập tên topping"
                    className="w-full p-2 border rounded-md mb-4"
                    required
                />
                <input
                    type="number"
                    value={newToppingPrice}
                    onChange={(e) => setNewToppingPrice(e.target.value)}
                    placeholder="Nhập giá topping"
                    min={0}
                    className="w-full p-2 border rounded-md"
                    required
                />
            </Modal>

            {/* Confirm Delete Topping Modal */}
            <Modal
                open={isDeleteToppingModalOpen}
                onClose={() => setIsDeleteToppingModalOpen(false)}
                onConfirm={handleRemoveTopping}
                title="Xác nhận xoá topping"
                confirmTitle="Xoá"
                closeTitle="Huỷ"
            >
                <div>Bạn có chắc chắn muốn xoá topping này không?</div>
            </Modal>

            {/* Confirm Delete Group Modal */}
            <Modal
                open={isDeleteGroupModalOpen}
                onClose={() => setIsDeleteGroupModalOpen(false)}
                onConfirm={handleConfirmDeleteGroup}
                title="Xác nhận xoá nhóm topping"
                confirmTitle="Xoá nhóm"
                closeTitle="Huỷ"
            >
                <div>
                    Bạn có chắc chắn muốn <strong>xóa nhóm topping</strong> này?{" "}
                    <br />
                    (Các topping bên trong cũng sẽ bị xóa!)
                </div>
            </Modal>

            <Header
                title={toppingGroup?.name || "Nhóm Topping"}
                goBack={true}
            />
            <div className="mt-24"></div>
            {!blockEdit && (
                <div className="flex justify-between items-center mx-4">
                    <LabelWithIcon
                        title="Thêm"
                        iconPath="/assets/plus.png"
                        onClick={() => {
                            setNewToppingName("");
                            setNewToppingPrice("");
                            setIsAddToppingModalOpen(true);
                        }}
                    />
                    <button
                        className="bg-red-600 text-white text-sm px-4 py-2 rounded-md"
                        onClick={handleDeleteToppingGroup}
                    >
                        Xóa nhóm topping
                    </button>
                </div>
            )}

            <div className="pt-2 pb-2 bg-gray-100 mt-4">
                <div className="bg-white rounded-md p-2">
                    {toppingGroup?.toppings?.length === 0 && (
                        <div className="text-gray-400 text-center italic py-4">
                            Chưa có topping nào
                        </div>
                    )}
                    {toppingGroup?.toppings?.map((topping) => (
                        <ToppingItem
                            key={topping._id}
                            item={topping}
                            openEditModal={openEditModal}
                            confirmDelete={() =>
                                confirmDeleteTopping(topping._id)
                            }
                            blockEdit={blockEdit}
                        />
                    ))}
                </div>
            </div>

            <NavBar page="menu" />
        </>
    );
};

const ToppingItem = ({ item, openEditModal, confirmDelete, blockEdit }) => (
    <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-md my-2">
        <p className="font-semibold">{item.name}</p>
        <div className="flex items-center space-x-3">
            <p className="text-gray-500 mr-4">{item.price}đ</p>
            {!blockEdit && (
                <>
                    <button
                        onClick={() => openEditModal(item)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                    >
                        Xóa
                    </button>
                </>
            )}
        </div>
    </div>
);

export default Page;
