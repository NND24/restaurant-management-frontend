"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getStoreRatings, replyToRating } from "@/service/rating";
import Modal from "@/components/Modal";
import { viVN } from "@/utils/constants";
import Heading from "@/components/Heading";
import { useTranslation } from "react-i18next";

const StoreReviewPage = () => {
  const { t } = useTranslation();
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
    status: r.storeReply ? t("rating.replied") : t("rating.not_replied"),
    raw: r,
  }));

  const columns = [
    {
      field: "avatar",
      headerName: t("rating.customer"),
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
      headerName: t("rating.rating_value"),
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className='text-yellow-500'>
          {"★".repeat(params.row.ratingValue) + "☆".repeat(5 - params.row.ratingValue)}
        </div>
      ),
    },
    { field: "comment", headerName: t("rating.comment"), headerAlign: "center", width: 220 },
    {
      field: "storeReply",
      headerName: t("rating.reply"),
      width: 220,
      headerAlign: "center",
      renderCell: (params) =>
        params.row.storeReply ? (
          <span className='text-gray-700'>{params.row.storeReply}</span>
        ) : (
          <span className='text-gray-400 italic'>{t("rating.not_replied")}</span>
        ),
    },
    {
      field: "status",
      headerName: t("common.status"),
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span className={params.value === t("rating.replied") ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
          {params.value}
        </span>
      ),
    },
    {
      field: "action",
      headerName: t("common.actions"),
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
          {params.row.storeReply ? t("rating.edit_reply") : t("rating.reply_action")}
        </button>
      ),
    },
  ];

  return (
    <div className='page-shell'>
      <Heading title={t("rating.title")} description='' keywords='' />
      <div className='responsive-grid-table' style={{ height: "calc(100vh - 160px)" }}>
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
        title={t("rating.reply_to_customer")}
        confirmTitle={t("rating.save_reply")}
        onConfirm={handleReplySave}
      >
        <textarea
          className='w-full px-3 py-2 border bg-[#f5f5f5] border-gray-300 rounded-lg shadow-sm h-[100px] resize-none transition'
          rows={4}
          placeholder={t("rating.reply_placeholder")}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default StoreReviewPage;
