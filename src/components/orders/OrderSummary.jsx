"use client";
import React, { useState } from "react";
import DishDetailModal from "../dish/DishDetailModal";
import ToppingDetailModal from "../topping/ToppingDetailModal";

const OrderSummary = ({ detailItems, subtotalPrice, shippingFee, totalDiscount }) => {
  const [openDetailDish, setOpenDetailDish] = useState(false);
  const [openDetailTopping, setOpenDetailTopping] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedToppingId, setSelectedToppingId] = useState(null);
  return (
    <>
      {openDetailDish && (
        <DishDetailModal open={openDetailDish} onClose={() => setOpenDetailDish(false)} id={selectedId} />
      )}

      {openDetailTopping && (
        <ToppingDetailModal
          open={openDetailTopping}
          onClose={() => setOpenDetailTopping(false)}
          id={selectedToppingId}
        />
      )}

      <div className='bg-white p-4 rounded-lg shadow-md mb-4'>
        <div className='pb-[20px] flex items-center justify-between'>
          <span className='text-[#4A4B4D] text-[18px] font-bold'>Tóm tắt đơn hàng</span>
        </div>

        <div className=' flex flex-col gap-[8px]'>
          {detailItems &&
            detailItems.map((item, index) => {
              const dishPrice = (item.dish?.price || 0) * item.quantity;
              const toppingsPrice =
                (Array.isArray(item.toppings)
                  ? item.toppings.reduce((sum, topping) => sum + (topping.price || 0), 0)
                  : 0) * item.quantity;
              const totalPrice = dishPrice + toppingsPrice;
              return (
                <div
                  className='flex gap-[15px] pb-[15px]'
                  style={{ borderBottom: "1px solid #a3a3a3a3" }}
                  name='cartItems'
                  key={index}
                >
                  <div className='p-[8px] rounded-[6px] border border-[#a3a3a3a3] border-solid w-[40px] h-[40px]'>
                    <span className='text-[#fc6011] font-semibold' name='quantity'>
                      {item.quantity}x
                    </span>
                  </div>

                  <div className='flex flex-col flex-1 justify-between'>
                    <div
                      className='flex justify-between cursor-pointer'
                      onClick={() => {
                        setSelectedId(item.dishId);
                        setOpenDetailDish(true);
                      }}
                    >
                      <span className='text-[#4A4B4D] text-[18px] font-bold line-clamp-1 pr-1' name='dishName'>
                        {item?.dishName}
                      </span>

                      <span className='text-[#4A4B4D]' name='price'>
                        {Number(item.price.toFixed(0)).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    {item.toppings.length > 0 &&
                      item.toppings.map((topping) => (
                        <div
                          key={topping._id}
                          className='flex justify-between cursor-pointer'
                          onClick={() => {
                            setSelectedToppingId(topping._id);
                            setOpenDetailTopping(true);
                          }}
                        >
                          <span className='text-[#a4a5a8]' name='toppingName'>
                            {topping.toppingName}
                          </span>

                          <span className='text-[#a4a5a8]' name='price'>
                            {Number(topping.price.toFixed(0)).toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      ))}
                    {item.note && (
                      <p className='text-[#a4a5a8]' name='toppingName'>
                        Ghi chú: {item.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

          <div className=''>
            {subtotalPrice > 0 && (
              <div className='flex items-center justify-between'>
                <span className='text-[#4A4B4D]'>Giá gốc</span>
                <span className='text-[#4A4B4D]'>{Number(subtotalPrice.toFixed(0)).toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            {totalDiscount > 0 && (
              <div className='flex items-center justify-between'>
                <span className='text-[#4A4B4D]'>Giảm giá</span>
                <span className='text-[#4A4B4D]'>{Number(totalDiscount.toFixed(0)).toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            {shippingFee > 0 && (
              <div className='flex items-center justify-between'>
                <span className='text-[#4A4B4D]'>Phí vận chuyển</span>
                <span className='text-[#4A4B4D]'>{Number(shippingFee.toFixed(0)).toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            {
              <div className='flex items-center justify-between'>
                <span className='text-[#4A4B4D] font-bold'>Tổng cộng</span>
                <span className='text-[#4A4B4D]'>
                  {Number((subtotalPrice - totalDiscount + shippingFee).toFixed(0)).toLocaleString("vi-VN")}đ
                </span>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSummary;
