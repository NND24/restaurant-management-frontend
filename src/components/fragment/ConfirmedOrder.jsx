import { useRouter } from "next/navigation";
import { updateOrder } from "@/service/order";
import Modal from "@/components/Modal";
import { useMemo, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import OrderSummary from "../orders/OrderSummary";

const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

const ConfirmedOrder = ({ order }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const { sendNotification } = useSocket();

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

  const handleUpdateOrder = async (order, status) => {
    try {
      await updateOrder({
        orderId: order._id,
        updatedData: { ...order, status },
      });
      sendNotification({
        userId: order.userId,
        title: "Cập nhật trạng thái đơn hàng",
        message: `Đơn hàng #${order._id} → ${statusTypes[status]}`,
        orderId: order._id,
        type: "info",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Optional: recompute for display sanity
  const computed = useMemo(() => {
    const items = order?.items || [];
    const subtotal = items.reduce((sum, it) => {
      const base = it?.dish?.price ?? it?.price ?? 0;
      const tops = (it?.toppings || []).reduce((s, t) => s + (t?.price || 0), 0);
      return sum + (it?.quantity || 0) * (base + tops);
    }, 0);
    const final = subtotal + (order?.shippingFee || 0) - (order?.totalDiscount || 0);
    return { subtotal, final };
  }, [order]);

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

  const paymentTypes = {
    cash: "Thanh toán khi nhận hàng",
    vnpay: "Thanh toán qua VNPay",
  };

  return (
    <>
      <div className=''>
        {/* Metadata */}
        <div className='bg-white p-4 rounded-lg shadow-md mb-4'>
          <div className='flex justify-between text-sm mb-2'>
            <span className='text-gray-600'>Mã đơn hàng</span>
            <span>{order?._id}</span>
          </div>
          <div className='flex justify-between text-sm mb-2'>
            <span className='text-gray-600'>Thời gian đặt hàng</span>
            <span className='text-gray-800'>{new Date(order?.createdAt).toLocaleString("vi-VN")}</span>
          </div>
          <div className='flex justify-between text-sm mb-2'>
            <span className='text-gray-600'>Trạng thái đơn hàng</span>
            <span className='text-gray-800'>{statusTypes[order?.status]}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>Phương thức thanh toán</span>
            <span className='text-gray-800'>{paymentTypes[order.paymentMethod] || "Không xác định"}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className='flex flex-col justify-between bg-white p-4 rounded-lg shadow-md mb-4'>
          <div className='pb-[20px] flex items-center justify-between'>
            <span className='text-[#4A4B4D] text-[18px] font-bold'>Khách hàng</span>
          </div>
          <div className='flex items-center gap-3'>
            <img src={"/assets/default-avatar.png"} alt='avatar' className='w-10 h-10 rounded-full object-cover' />
            <div className='ml-0'>
              <h3 className='text-gray-800 font-medium'>{order?.shipInfo?.contactName || "Không xác định"}</h3>
              <p className='text-sm text-gray-600'>{order?.shipInfo?.contactPhonenumber || "Không có số điện thoại"}</p>
              <p className='text-sm text-gray-600'>{order?.shipInfo?.address || "Không có địa chỉ"}</p>
            </div>
            {/* <button className="py-1 px-3 bg-[#fc6011] text-white rounded-md hover:bg-[#e9550f]">
                Gọi
              </button> */}
          </div>
        </div>

        <OrderSummary
          detailItems={order?.items}
          subtotalPrice={order?.subtotalPrice}
          shippingFee={order?.shippingFee}
          totalDiscount={order?.totalDiscount}
        />

        <div className='flex w-full space-x-4 justify-between my-4 p-1'>
          <button
            className='py-2 px-4 bg-gray-200 text-md text-gray-700 rounded-md hover:bg-gray-300 w-full'
            onClick={() => setShowModal(true)}
          >
            Hủy đơn hàng
          </button>
          {order.status === "finished" ? (
            <button
              className='py-2 px-4 bg-[#fc6011] text-md text-white rounded-md hover:bg-[#e9550f] w-full'
              onClick={() => handleUpdateOrder(order, "taken")}
            >
              Giao tài xế
            </button>
          ) : (
            <button
              className='py-2 px-4 bg-[#fc6011] text-md text-white rounded-md hover:bg-[#e9550f] w-full'
              onClick={() => handleUpdateOrder(order, "finished")}
            >
              Thông báo tài xế
            </button>
          )}
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleUpdateOrderToCancel}
        title='Xác nhận hủy đơn hàng'
        confirmTitle='Đồng ý'
        closeTitle='Không'
      >
        Bạn có chắc chắn muốn <strong>hủy đơn hàng</strong> này không?
      </Modal>
    </>
  );
};

export default ConfirmedOrder;
