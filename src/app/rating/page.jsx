"use client";

import { useEffect, useState } from "react";
import { getStoreRatings, replyToRating } from "@/service/rating";
import Modal from "@/components/Modal";
import ReactPaginate from "react-paginate";
import { ThreeDots } from "react-loader-spinner";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";

const StoreReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchReviews = async () => {
        setLoading(true);
        const replied =
            filter === "replied"
                ? "true"
                : filter === "not_replied"
                ? "false"
                : undefined;
        const res = await getStoreRatings({ page, limit: 5, replied });

        if (res?.success) {
            setReviews(res.data);
            setTotalPages(res.totalPages || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, [page, filter]);

    const handleReplyOpen = (review) => {
        setSelectedReview(review);
        setReplyText(review.storeReply || "");
    };

    const handleReplySave = async () => {
        if (selectedReview) {
            const res = await replyToRating(selectedReview._id, replyText);
            if (res?.success) {
                setSelectedReview(null);
                fetchReviews(); // refresh
            }
        }
    };

    const handlePageClick = (event) => {
        setPage(event.selected + 1);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <Header title="Đánh giá" goBack={true} />

            <div className="mb-4 mt-20">
                <select
                    value={filter}
                    onChange={(e) => {
                        setPage(1);
                        setFilter(e.target.value);
                    }}
                    className="border px-3 py-2 rounded"
                >
                    <option value="all">Tất cả</option>
                    <option value="replied">Đã phản hồi</option>
                    <option value="not_replied">Chưa phản hồi</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <ThreeDots
                        visible={true}
                        height="80"
                        width="80"
                        color="#fc6011"
                        radius="9"
                        ariaLabel="three-dots-loading"
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review._id}
                            className="border rounded-lg p-4 shadow"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <img
                                    src={review.user?.avatar?.url}
                                    alt={review.user?.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="font-semibold">
                                    {review.user?.name}
                                </span>
                            </div>

                            <div className="text-yellow-500 mb-1">
                                {Array(review.ratingValue).fill("★").join("")}
                                {Array(5 - review.ratingValue)
                                    .fill("☆")
                                    .join("")}
                            </div>

                            <p className="mb-2">{review.comment}</p>

                            {review.storeReply ? (
                                <div className="bg-gray-100 p-2 rounded mb-2 text-sm text-gray-700">
                                    <strong>Phản hồi của cửa hàng:</strong>{" "}
                                    {review.storeReply}
                                </div>
                            ) : null}

                            <button
                                onClick={() => handleReplyOpen(review)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                {review.storeReply
                                    ? "Chỉnh sửa phản hồi"
                                    : "Phản hồi"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-6">
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
                        onPageChange={handlePageClick}
                        forcePage={page - 1}
                        containerClassName="pagination flex space-x-2"
                        activeClassName="bg-orange-500 text-white"
                        pageClassName="border px-3 py-1 rounded-lg cursor-pointer"
                        previousClassName="border px-3 py-1 rounded-lg cursor-pointer"
                        nextClassName="border px-3 py-1 rounded-lg cursor-pointer"
                        disabledClassName="opacity-50 cursor-not-allowed"
                    />
                </div>
            )}

            <Modal
                open={!!selectedReview}
                onClose={() => setSelectedReview(null)}
                title="Phản hồi khách hàng"
                confirmTitle="Lưu phản hồi"
                onConfirm={handleReplySave}
            >
                <textarea
                    className="w-full border border-gray-700 ring-1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Nhập phản hồi của bạn tại đây..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                />
            </Modal>
            <NavBar page='orders' />
        </div>
    );
};

export default StoreReviewPage;
