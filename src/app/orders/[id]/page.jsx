"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrder } from "@/service/order";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import LatestOrder from "@/components/fragment/LatestOrder";
import ConfirmedOrder from "@/components/fragment/ConfirmedOrder";
import HistoryOrder from "@/components/fragment/HistoryOrder";
import { ThreeDots } from "react-loader-spinner";
 

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchOrder = async () => {
            try {
                console.log(id)
                setIsLoading(true);
                const response = await getOrder({orderId:id});
                console.log(response)
                setOrder(response?.data);
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError("Lỗi khi tải đơn hàng.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (!id) return <p>Invalid Order ID</p>;
    if (isLoading) return <p>
        <div className="flex justify-center items-center h-screen w-screen">
            <ThreeDots
              visible={true}
              height="80"
              width="80"
              color="#fc6011"
              radius="9"
              ariaLabel="three-dots-loading"
            />
          </div></p>;
    if (error) return <p>{error}</p>;
    if (!order) return <p>Không tìm thấy đơn hàng</p>;

    const getOrderComponent = () => {
        console.log(order)
        switch (order?.status) {
            case "pending":
                return <LatestOrder order={order} />;
            case "confirmed":
            case "finished":
                return <ConfirmedOrder order={order} />;
            default:
                return <HistoryOrder order={order} />;
        }
    };

    return (
        <>
            <Header title="Chi tiết đơn hàng" goBack={true} />
            {getOrderComponent()}
            <NavBar page="orders" />
        </>
    );
};

export default OrderDetailsPage;
