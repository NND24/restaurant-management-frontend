import { useRouter } from "next/navigation";
import { updateOrder } from "@/service/order";
import Modal from "@/components/Modal";
import { useMemo, useState } from "react";

const formatVND = (n) =>
    (n ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    });

const ConfirmedOrder = ({ order }) => {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const handleUpdateOrderToCancel = async () => {
        try {
            await updateOrder({
                orderId: order._id,
                updatedData: { ...order, status: "cancelled" },
            });
            setShowModal(false);
            router.back();
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    // Optional: recompute for display sanity
    const computed = useMemo(() => {
        const items = order?.items || [];
        const subtotal = items.reduce((sum, it) => {
            const base = it?.dish?.price ?? it?.price ?? 0;
            const tops = (it?.toppings || []).reduce(
                (s, t) => s + (t?.price || 0),
                0
            );
            return sum + (it?.quantity || 0) * (base + tops);
        }, 0);
        const final =
            subtotal + (order?.shippingFee || 0) - (order?.totalDiscount || 0);
        return { subtotal, final };
    }, [order]);

    return (
        <>
            <div className="w-full px-4 py-2 mt-20">
                <div className="w-full p-4 bg-gray-50">
                    {/* <div className="p-2 bg-yellow-100 text-yellow-800 text-sm rounded-md mb-4">
            Khách ghi chú: <span className="font-semibold">{order.}Không có ghi chú</span>
          </div> */}

                    {/* Customer Info */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md mb-4">
                        <div className="flex items-center gap-3">
                        <img
                        src={"/assets/default-avatar.png"}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                            <div className="ml-0">
                                <h3 className="text-gray-800 font-medium">
                                    {order?.shipInfo?.contactName ||
                                        "Không xác định"}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {order?.shipInfo?.contactPhonenumber ||
                                        "Không có số điện thoại"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {order?.shipInfo?.address ||
                                        "Không có địa chỉ"}
                                </p>
                            </div>
                            {/* <button className="py-1 px-3 bg-[#fc6011] text-white rounded-md hover:bg-[#e9550f]">
                Gọi
              </button> */}
                        </div>
                    </div>

                    {/* Order Items with toppings + line totals */}
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                        <ul className="mb-4 text-sm text-gray-700 space-y-3">
                            {order?.items?.map((item) => {
                                const basePrice =
                                    item?.dish?.price ?? item?.price ?? 0;
                                const toppingTotal = (
                                    item?.toppings || []
                                ).reduce((s, t) => s + (t?.price || 0), 0);
                                const unitTotal = basePrice + toppingTotal;
                                const lineTotal =
                                    (item?.quantity || 0) * unitTotal;

                                return (
                                    <li
                                        key={item._id}
                                        className="py-2 border-b last:border-b-0"
                                    >
                                        <div className="flex justify-between">
                                            <span>
                                                {item.quantity} x{" "}
                                                {item.dish?.name ||
                                                    item.dishName}
                                            </span>
                                            <span className="font-medium">
                                                {formatVND(basePrice)}
                                            </span>
                                        </div>

                                        {(item?.toppings?.length ?? 0) > 0 && (
                                            <div className="mt-1 pl-4">
                                                {/* <div className="text-xs text-gray-500 mb-1">Topping:</div> */}
                                                <ul className="text-xs text-gray-700 space-y-0.5">
                                                    {item.toppings.map((t) => (
                                                        <li
                                                            key={t._id}
                                                            className="flex justify-between"
                                                        >
                                                            <span>
                                                                -{" "}
                                                                {t.toppingName}
                                                            </span>
                                                            <span>
                                                                {formatVND(
                                                                    t.price
                                                                )}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {item.note &&
                                            item.note.trim() !== "" && (
                                                <div className="mt-1 pl-4">
                                                    <div className="text-xs text-gray-500 italic">
                                                        Ghi chú:
                                                    </div>
                                                    <div className="text-xs text-gray-700">
                                                        {item.note}
                                                    </div>
                                                </div>
                                            )}

                                        {/* <div className="mt-1 flex justify-between">
                      <span className="text-xs text-gray-500">
                        Thành tiền (bao gồm topping)
                      </span>
                      <span className="text-[#fc6011] font-semibold">
                        {formatVND(lineTotal)}
                      </span>
                    </div> */}
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Order Summary */}
                        <div className="text-sm">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-700">Giảm giá</span>
                                <span className="text-gray-800 font-medium">
                                    {formatVND(order?.totalDiscount || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-700">
                                    Phí giao hàng
                                </span>
                                <span className="text-gray-800 font-medium">
                                    {formatVND(order?.shippingFee || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-700 font-bold">
                                    Tổng tiền món (giá gốc)
                                </span>
                                <span className="text-gray-800 font-medium">
                                    {formatVND(
                                        order?.subtotalPrice ??
                                            computed.subtotal
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-md font-bold">
                                    Tổng tiền quán nhận
                                </span>
                                <span className="text-md font-bold text-[#fc6011]">
                                    {formatVND(
                                        order?.finalTotal ?? computed.final
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Mã đơn hàng</span>
                            <span>{order?._id}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">
                                Thời gian đặt hàng
                            </span>
                            <span className="text-gray-800">
                                {new Date(order?.createdAt).toLocaleTimeString(
                                    "vi-VN",
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                    }
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex w-full space-x-4 justify-between my-4 p-1">
                        <button
                            className="py-2 px-4 bg-gray-200 text-md text-gray-700 rounded-md hover:bg-gray-300 w-full"
                            onClick={() => setShowModal(true)}
                        >
                            Hủy
                        </button>
                        <button
                            className="py-2 px-4 bg-[#fc6011] text-md text-white rounded-md hover:bg-[#e9550f] w-full"
                            onClick={() =>
                                router.push(`/orders/${order._id}/update`)
                            }
                        >
                            Sửa
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleUpdateOrderToCancel}
                title="Xác nhận hủy đơn hàng"
                confirmTitle="Đồng ý"
                closeTitle="Không"
            >
                Bạn có chắc chắn muốn <strong>hủy đơn hàng</strong> này không?
            </Modal>
        </>
    );
};

export default ConfirmedOrder;
