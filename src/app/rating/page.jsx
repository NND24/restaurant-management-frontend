"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getStoreRatings, replyToRating } from "@/service/rating";
import Modal from "@/components/Modal";
import { viVN } from "@/utils/constants";

const StoreReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0); // DataGrid page index (0-based)
  const [pageSize, setPageSize] = useState(5);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    const replied = filter === "replied" ? "true" : filter === "not_replied" ? "false" : undefined;

    const res = await getStoreRatings({
      page: page + 1, // API đang dùng 1-based
      limit: pageSize,
      replied,
    });

    if (res?.success) {
      setReviews(res.data ?? []);
      setRowCount(res.totalItems || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [page, pageSize, filter]);

  const handleReplyOpen = (review) => {
    setSelectedReview(review);
    setReplyText(review.storeReply || "");
  };

  const handleReplySave = async () => {
    if (selectedReview) {
      const res = await replyToRating(selectedReview._id, replyText);
      if (res?.success) {
        setSelectedReview(null);
        fetchReviews();
      }
    }
  };

  const rows = reviews.map((r) => ({
    id: r._id,
    avatar: r.user?.avatar?.url,
    customer: r.user?.name,
    ratingValue: r.ratingValue,
    comment: r.comment,
    storeReply: r.storeReply,
    status: r.storeReply ? "Đã phản hồi" : "Chưa phản hồi",
    raw: r,
  }));

  const columns = [
    {
      field: "avatar",
      headerName: "Khách hàng",
      width: 200,
      renderCell: (params) => (
        <div className='flex items-center gap-2'>
          <img src={params.row.avatar} alt={params.row.customer} className='w-8 h-8 rounded-full object-cover' />
          <span>{params.row.customer}</span>
        </div>
      ),
    },
    {
      field: "ratingValue",
      headerName: "Đánh giá",
      width: 120,
      renderCell: (params) => (
        <div className='text-yellow-500'>
          {"★".repeat(params.row.ratingValue) + "☆".repeat(5 - params.row.ratingValue)}
        </div>
      ),
    },
    { field: "comment", headerName: "Bình luận", width: 250 },
    {
      field: "storeReply",
      headerName: "Phản hồi",
      width: 250,
      renderCell: (params) =>
        params.row.storeReply ? (
          <span className='text-gray-700'>{params.row.storeReply}</span>
        ) : (
          <span className='text-gray-400 italic'>Chưa phản hồi</span>
        ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params) => (
        <span className={params.value === "Đã phản hồi" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
          {params.value}
        </span>
      ),
    },
    {
      field: "action",
      headerName: "Hành động",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <button
          onClick={() => handleReplyOpen(params.row.raw)}
          className='px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm'
        >
          {params.row.storeReply ? "Chỉnh sửa" : "Phản hồi"}
        </button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ height: "70vh", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          pagination
          paginationMode='server'
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => setPageSize(newSize)}
          rowsPerPageOptions={[5, 10, 20]}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          autoHeight={false}
          localeText={viVN}
        />
      </div>

      <Modal
        open={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title='Phản hồi khách hàng'
        confirmTitle='Lưu phản hồi'
        onConfirm={handleReplySave}
      >
        <textarea
          className='w-full border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          rows={4}
          placeholder='Nhập phản hồi của bạn tại đây...'
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default StoreReviewPage;
