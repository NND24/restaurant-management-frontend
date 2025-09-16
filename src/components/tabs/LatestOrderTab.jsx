"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllOrders, updateOrder } from "@/service/order";
import { useSocket } from "@/context/SocketContext";
import ReactPaginate from "react-paginate";
import { ThreeDots } from "react-loader-spinner";

const formatVND = (n) =>
    (n ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    });
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
const OrderCard = ({ order, orderIndex, refetch }) => {
    const [cartPrice, setCartPrice] = useState(0);
    const [cartQuantity, setCartQuantity] = useState(0);
    const { sendNotification } = useSocket();
    const handleUpdateOrder = async () => {
        if (!order) return;
        try {
            console.log(order._id);
            const updatedOrder = { ...order, status: "confirmed" };
            console.log("Updating order:", {
                userId: order.userId,
                title: "Cập nhật trạng thái đơn hàng",
                message: `Đơn hàng #${order._id} đã được xác nhận.`,
                orderId: order._id,
                type: "info",
            });
            sendNotification({
                userId: order.userId,
                title: "Cập nhật trạng thái đơn hàng",
                message: `Đơn hàng #${order._id} đã được xác nhận.`,
                orderId: order._id,
                type: "info",
            });
            const orderId = order._id;
            await updateOrder({ orderId, updatedData: updatedOrder });
            refetch();
        } catch (error) {
            console.error("Failed to update order:", error);
        }
    };

    const router = useRouter();

    const calculateCartPrice = () => {
        const { totalPrice, totalQuantity } = order.items.reduce(
            (acc, item) => {
                const dishPrice = (item.dish?.price || 0) * item.quantity;
                const toppingsPrice =
                    (Array.isArray(item.toppings)
                        ? item.toppings.reduce(
                              (sum, topping) => sum + (topping.price || 0),
                              0
                          )
                        : 0) * item.quantity;

                acc.totalPrice += dishPrice + toppingsPrice;
                acc.totalQuantity += item.quantity;
                return acc;
            },
            { totalPrice: 0, totalQuantity: 0 }
        );

        setCartPrice(totalPrice);
        setCartQuantity(totalQuantity);
    };

    useEffect(() => {
        calculateCartPrice();
    }, []);

    // In OrderCard (just the outer <div> and a few spans/buttons)
    return (
        <div
            className="border rounded-lg shadow-md p-4 bg-[#FCF5F4] mb-4 cursor-pointer hover:shadow-lg transition"
            data-testid="order-row"
            data-order-id={order._id}
            data-total-qty={cartQuantity}
            data-total-price={cartPrice}
            onClick={() => router.push(`orders/${order._id}`)} // whole card clickable
        >
            {/* Top Row */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                    <div className="bg-[#fc6011] px-3 py-2 text-white font-bold text-lg flex items-center justify-center rounded-md">
                        {orderIndex}
                    </div>
                    <div className="ml-3 text-sm text-gray-700">
                        <p
                            className="font-medium text-gray-800 text-base"
                            data-testid="customer-name"
                        >
                            {order.user?.name}
                        </p>

                        {/* Totals */}
                        <p className="text-gray-600">
                            <span data-testid="total-qty">{cartQuantity}</span>{" "}
                            món /{" "}
                            <span data-testid="total-price">
                                {formatVND(order.finalTotal)}
                            </span>
                        </p>

                        {/* Order ID */}
                        <p
                            className="text-xs text-gray-400 mt-1"
                            data-testid="order-id-text"
                        >
                            Mã đơn: <span>{order._id}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <ul
                className="text-sm text-gray-700 mb-4 space-y-1"
                data-testid="items"
            >
                {order.items.map((item, idx) => {
                    const toppingCount = item.toppings?.length || 0;
                    return (
                        <li
                            key={idx}
                            data-testid="item-row"
                            data-item-name={item.dish?.name}
                            data-item-qty={item.quantity}
                            data-item-topping-count={toppingCount}
                        >
                            {item.quantity} x {item.dish.name}{" "}
                            {toppingCount > 0
                                ? `(${toppingCount} Topping)`
                                : ""}
                        </li>
                    );
                })}
            </ul>

            {/* Confirm Button */}
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
                        <span className="font-medium">
                            {statusTypes[order.status]}
                        </span>
                    </p>
                </div>
                <button
                    data-testid="btn-confirm"
                    className="px-4 py-2 text-white bg-[#fc6011] rounded-sm hover:bg-[#e9550f]"
                    onClick={(e) => {
                        e.stopPropagation(); // prevent triggering card click
                        handleUpdateOrder();
                    }}
                >
                    Xác nhận
                </button>
            </div>
        </div>
    );
};

const LatestOrder = ({ storeId }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const ordersPerPage = 10;

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getAllOrders({
                storeId,
                status: "pending",
                limit: ordersPerPage,
                page: currentPage,
            });

            setOrders(res.data || []);
            setTotalPages(res.totalPages || 1);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storeId) fetchOrders();
    }, [storeId, currentPage]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-screen">
                <ThreeDots
                    visible={true}
                    height="80"
                    width="80"
                    color="#fc6011"
                    radius="9"
                />
            </div>
        );
    }

    const handlePageClick = (event) => {
        setCurrentPage(event.selected + 1);
    };

    const sortedOrders = [...orders].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    return (
        <div className="w-full px-4 py-2">
            {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                    Không có đơn hàng nào.
                </p>
            ) : (
                sortedOrders.map((order, index) => (
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
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
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
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    }
                    breakLabel="..."
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    forcePage={currentPage - 1}
                    onPageChange={handlePageClick}
                    containerClassName="pagination flex space-x-2"
                    activeClassName="bg-orange-500 text-white"
                    pageClassName="border px-3 py-1 rounded-lg cursor-pointer"
                    previousClassName="border px-3 py-1 rounded-lg cursor-pointer"
                    nextClassName="border px-3 py-1 rounded-lg cursor-pointer"
                    disabledClassName="opacity-50 cursor-not-allowed"
                />
            </div>
        </div>
    );
};

export default LatestOrder;
