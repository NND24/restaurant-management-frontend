import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { haversineDistance, calculateTravelTime } from "@/utils/functions";
import localStorageService from "@/utils/localStorageService";
import OrderSummary from "../orders/OrderSummary";
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
};

const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

const HistoryOrder = ({ order }) => {
  const router = useRouter();
  const store = localStorageService.getStore();
  const [distance, setDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
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

  useEffect(() => {
    if (order?.shipInfo?.shipLocation?.coordinates && store?.address?.lat && store?.address?.lon) {
      const coords1 = order.shipInfo.shipLocation.coordinates;
      const coords2 = [store.address.lon, store.address.lat];
      const d = haversineDistance(coords1, coords2);
      setDistance(d.toFixed(2)); // store in km
      setTravelTime(calculateTravelTime(d.toFixed(2), 40));
    }
  }, [order, store]);

  return (
    <div className=''>
      {/* Order Metadata */}
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
        <div className='flex items-center'>
          <img src={"/assets/default-avatar.png"} alt='avatar' className='w-10 h-10 rounded-full object-cover' />

          <div className='ml-3'>
            <h3 className='text-gray-800 font-medium'>{order?.shipInfo?.contactName || "Không xác định"}</h3>
            <p className='text-sm text-gray-600'>{order?.shipInfo?.contactPhonenumber || "Không có số điện thoại"}</p>
            <p className='text-sm text-gray-600'>{order?.shipInfo?.address || "Không có địa chỉ"}</p>
          </div>
        </div>
        {/* <button className="py-1 px-3 bg-[#fc6011] text-white rounded-md hover:bg-[#e9550f]">Gọi</button> */}
      </div>

      {/* Driver Info */}
      {/* <div className="flex items-center bg-white p-4 rounded-lg shadow-md mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"></div>
                    <div className="ml-3">
                        <h3 className="text-gray-800 font-medium">
                            {order?.driver || "Chưa có tài xế"}
                        </h3>
                    </div>
                </div> */}

      <OrderSummary
        detailItems={order?.items}
        subtotalPrice={order?.subtotalPrice}
        shippingFee={order?.shippingFee}
        totalDiscount={order?.totalDiscount}
      />
    </div>
  );
};

export default HistoryOrder;
