"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getStoreRatings, replyToRating } from "@/service/rating";
import Modal from "@/components/Modal";
import { viVN } from "@/utils/constants";

const StoreReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getStoreRatings(storeId);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [storeId]);

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
      headerAlign: "center",
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
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className='text-yellow-500'>
          {"★".repeat(params.row.ratingValue) + "☆".repeat(5 - params.row.ratingValue)}
        </div>
      ),
    },
    { field: "comment", headerName: "Bình luận", headerAlign: "center", width: 220 },
    {
      field: "storeReply",
      headerName: "Phản hồi",
      width: 220,
      headerAlign: "center",
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
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span className={params.value === "Đã phản hồi" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
          {params.value}
        </span>
      ),
    },
    {
      field: "action",
      headerName: "Hành động",
      width: 180,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <button
          onClick={() => handleReplyOpen(params.row.raw)}
          className='px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm'
        >
          {params.row.storeReply ? "Chỉnh sửa phản hồi" : "Phản hồi"}
        </button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ height: "95vh", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          pageSizeOptions={[]}
          initialState={{
            pagination: { paginationModel: { pageSize: 12 } },
          }}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          disableRowSelectionOnClick
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
          className='w-full px-3 py-2 border bg-[#f5f5f5] border-gray-300 rounded-lg shadow-sm h-[100px] resize-none transition'
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
