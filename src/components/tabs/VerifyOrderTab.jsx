"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Dropdown from "@/components/Dropdown";
import generateOrderNumber from "../../utils/generateOrderNumber";
import ReactPaginate from "react-paginate";
import { getAllOrders, updateOrder } from "@/service/order";
import { ThreeDots } from "react-loader-spinner";
import localStorageService from "@/utils/localStorageService"; // <-- make sure this path is correct
import { useSocket } from "@/context/SocketContext";

const statusMap = {
    "Tất cả": "all",
    "Đang chuẩn bị": "confirmed",
    "Đã thông báo tài xế": "finished",
};

const paymentTypes = {
    cash: "Thanh toán khi nhận hàng",
    vnpay: "Thanh toán qua VNPay",
};

const statusTypes = {
    pending: "Đang chờ",
    preparing: "Đang chuẩn bị",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    completed: "Hoàn thành",
    taken: "Đã lấy",
    delivering: "Đang giao",
    done: "Đã xong",
    finished: "Đã thông báo tài xế",
    confirmed: "Đang chuẩn bị",
};

const reverseStatusMap = {
    all: "Tất cả",
    confirmed: "Đang chuẩn bị",
    finished: "Đã thông báo tài xế",
};

const formatVND = (n) =>
    (n ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    });

const OrderCard = ({ order, orderIndex, refetch }) => {
    const [cartQuantity, setCartQuantity] = useState(0);
    const { sendNotification } = useSocket();

    useEffect(() => {
        if (order.items) {
            const total = order.items.reduce(
                (acc, item) => {
                    const toppingsPrice =
                        (Array.isArray(item.toppings)
                            ? item.toppings.reduce(
                                  (sum, topping) => sum + (topping.price || 0),
                                  0
                              )
                            : 0) * item.quantity;

                    acc.quantity += item.quantity;
                    acc.price +=
                        (item.dish?.price || 0) * item.quantity + toppingsPrice;
                    return acc;
                },
                { price: 0, quantity: 0 }
            );

            setCartQuantity(total.quantity);
        }
    }, [order.items]);

    const handleUpdateOrderToFinish = async () => {
        try {
            await updateOrder({
                orderId: order._id,
                updatedData: { ...order, status: "finished" },
            });
            console.log("Updating order:", {
                userId: order.userId,
                title: "Cập nhật trạng thái đơn hàng",
                message: `Đơn hàng #${order._id} đã được hoàn tất.`,
                orderId: order._id,
                type: "info",
            });
            sendNotification({
                userId: order.userId,
                title: "Cập nhật trạng thái đơn hàng",
                message: `Đơn hàng #${order._id} đã được hoàn tất.`,
                orderId: order._id,
                type: "info",
            });
            refetch();
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleUpdateOrderToTaken = async () => {
        try {
            await updateOrder({
                orderId: order._id,
                updatedData: { ...order, status: "taken" },
            });
            console.log("Updating order:", {
                userId: order.userId,
                title: "Cập nhật trạng thái đơn hàng",
                message: `Đơn hàng #${order._id} đã được nhận bởi shipper.`,
                type: "info",
            });
            sendNotification({
                userId: order.userId,
                title: "Cập nhật trạng thái đơn hàng",
                message: `Đơn hàng #${order._id} đã được nhận bởi shipper.`,
                type: "info",
                orderId: order._id,
            });
            refetch();
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    return (
        <div
            className="border rounded-lg shadow-md p-4 bg-white mb-4"
            data-testid="verify-order-row"
            data-order-id={order._id}
            data-status={order.status}
        >
            {/* Clickable card */}
            <Link href={`orders/${order._id}`} passHref>
                <div className="flex justify-between items-start mb-4 cursor-pointer">
                    {/* Left Section */}
                    <div className="flex items-center">
                        <div className="bg-[#fc6011] text-white font-bold text-lg w-10 h-10 flex items-center justify-center rounded-sm">
                            {orderIndex}
                        </div>
                        <div className="ml-3">
                            <p className="font-bold text-[#fc6011] text-lg">
                                #{generateOrderNumber(order._id)}
                            </p>
                            <p className="text-sm text-gray-600">
                                {cartQuantity} món •{" "}
                                {formatVND(order.finalTotal)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleString(
                                    "vi-VN"
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="text-right">
                        <p className="text-gray-800 font-medium text-sm">
                            {order.user?.name ||
                                order.shipInfo?.contactName ||
                                "Khách lạ"}
                        </p>
                        <p className="text-xs text-gray-500">
                            {order.shipInfo?.contactPhonenumber || ""}
                        </p>
                        <p className="text-xs text-gray-400 max-w-[180px] truncate">
                            {order.shipInfo?.address}
                        </p>
                    </div>
                </div>
            </Link>

            {/* Items preview */}
            <ul
                className="text-sm text-gray-700 mb-3 space-y-1"
                data-testid="items"
            >
                {order.items.map((item, idx) => {
                    const toppingCount = item.toppings?.length || 0;
                    return (
                        <li key={idx} className="flex justify-between">
                            <span>
                                {item.quantity} ×{" "}
                                {item.dish?.name || item.dishName}{" "}
                                {toppingCount > 0
                                    ? `(${toppingCount} topping)`
                                    : ""}
                            </span>
                            <span>{formatVND(item.price)}</span>
                        </li>
                    );
                })}
            </ul>

            {/* Payment & status */}
            <div className="flex justify-between items-center border-t pt-3 mt-2 text-sm">
                <div className="space-y-1">
                    <p>
                        <span className="text-gray-600">Thanh toán: </span>
                        <span className="font-medium capitalize">
                            {paymentTypes[order.paymentMethod]}
                        </span>
                    </p>
                    <p>
                        <span className="text-gray-600">Trạng thái: </span>
                        <span className="font-medium">{statusTypes[order.status]}</span>
                    </p>
                </div>

                {/* Actions */}
                {order.status === "finished" ? (
                    <button
                        data-testid="btn-taken"
                        className="px-4 py-2 text-white bg-[#fc6011] rounded-md hover:bg-[#e9550f] transition"
                        onClick={handleUpdateOrderToTaken}
                    >
                        Giao tài xế
                    </button>
                ) : (
                    <button
                        data-testid="btn-finish"
                        className="px-4 py-2 text-white bg-[#fc6011] rounded-md hover:bg-[#e9550f] transition"
                        onClick={handleUpdateOrderToFinish}
                    >
                        Thông báo tài xế
                    </button>
                )}
            </div>
        </div>
    );
};

const VerifyOrderTab = ({ storeId }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const dropdownOptions = ["Tất cả", "Đang chuẩn bị", "Đã thông báo tài xế"];
    const ordersPerPage = 10;

    const [selectedStatus, setSelectedStatus] = useState(() => {
        const fromStorage = localStorageService.getActiveFilter();
        const fromURL = searchParams.get("status");
        return fromStorage || fromURL || "all";
    });

    const [currentPage, setCurrentPage] = useState(() => {
        const pageParam = parseInt(searchParams.get("page") || "1", 10);
        return isNaN(pageParam) ? 1 : pageParam;
    });

    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const urlStatus = searchParams.get("status");
        const urlPage = searchParams.get("page");

        if (!urlStatus || !urlPage) {
            const statusToSet = urlStatus || "all";
            const pageToSet = urlPage || "1";

            const params = new URLSearchParams(searchParams.toString());
            params.set("status", statusToSet);
            params.set("page", pageToSet);

            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const statuses =
                selectedStatus === "all"
                    ? ["confirmed", "finished"]
                    : [selectedStatus];
            const res = await getAllOrders({
                storeId,
                status: statuses,
                limit: ordersPerPage,
                page: currentPage,
            });

            setOrders(
                res.data?.toSorted(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                ) || []
            );
            setTotalPages(res.totalPages || 1);
        } catch (err) {
            console.error(err);
            setError("Không thể tải đơn hàng.");
        } finally {
            setIsLoading(false);
        }
    }, [storeId, selectedStatus, currentPage]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateQuery = (newStatus, newPage = 1) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("status", newStatus);
        params.set("page", newPage.toString());
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const handleDropdownChange = (value) => {
        const statusCode = statusMap[value];
        if (!statusCode) return;
        setSelectedStatus(statusCode);
        localStorageService.setActiveFilter(statusCode);
        updateQuery(statusCode, 1);
        setCurrentPage(1);
    };

    const handlePageClick = (event) => {
        const newPage = event.selected + 1;
        updateQuery(selectedStatus, newPage);
        setCurrentPage(newPage);
    };

    const selectedStatusLabel = reverseStatusMap[selectedStatus] || "Tất cả";

    if (error) {
        return <p className="text-center py-5 text-red-500">{error}</p>;
    }

    return (
        <div className="w-full px-4 py-2">
            <Dropdown
                options={dropdownOptions}
                onChange={handleDropdownChange}
                value={selectedStatusLabel}
            />
            {isLoading ? (
                <div className="flex justify-center items-center h-screen w-screen">
                    <ThreeDots
                        visible={true}
                        height="80"
                        width="80"
                        color="#fc6011"
                        radius="9"
                    />
                </div>
            ) : (
                <>
                    {orders.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">
                            Không có đơn hàng nào.
                        </p>
                    ) : (
                        orders.map((order, index) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                orderIndex={(
                                    index +
                                    (currentPage - 1) * ordersPerPage +
                                    1
                                )
                                    .toString()
                                    .padStart(2, "0")}
                                refetch={fetchOrders}
                            />
                        ))
                    )}

                    <div className="flex items-center justify-center w-full h-max mt-10 mb-20">
                        <ReactPaginate
                            previousLabel={
                                <svg
                                    className="w-5 h-5"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            }
                            nextLabel={
                                <svg
                                    className="w-5 h-5"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            }
                            breakLabel={"..."}
                            pageCount={totalPages}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            forcePage={currentPage - 1}
                            containerClassName={"pagination flex space-x-2"}
                            activeClassName={"bg-orange-500 text-white"}
                            pageClassName={
                                "border px-3 py-1 rounded-lg cursor-pointer"
                            }
                            previousClassName={
                                "border px-3 py-1 rounded-lg cursor-pointer"
                            }
                            nextClassName={
                                "border px-3 py-1 rounded-lg cursor-pointer"
                            }
                            disabledClassName={"opacity-50 cursor-not-allowed"}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default VerifyOrderTab;
