"use client";

import React, { useEffect, useState } from "react";
import { getVoucherUsageSummary, getTopUsedVouchers, getVoucherRevenueImpact } from "@/service/statistic";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Heading from "@/components/Heading";
import { useTranslation } from "react-i18next";

const SummaryCard = ({ title, value, color, icon }) => (
  <div className='flex items-center justify-between bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all'>
    <div>
      <p className='text-sm text-gray-500'>{title}</p>
      <p className='text-2xl font-semibold text-gray-800 mt-1'>{value}</p>
    </div>
    <div
      className='w-12 h-12 flex items-center justify-center rounded-full text-white shadow-md'
      style={{ background: color }}
    >
      {icon}
    </div>
  </div>
);

const page = () => {
  const { t } = useTranslation();
  const [from, setFrom] = useState(format(new Date(), "yyyy-MM-01"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [limit, setLimit] = useState(5);

  const [usageSummary, setUsageSummary] = useState(null);
  const [topVouchers, setTopVouchers] = useState([]);
  const [revenueImpact, setRevenueImpact] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [summaryRes, topRes, revenueRes] = await Promise.all([
        getVoucherUsageSummary(from, to),
        getTopUsedVouchers(limit, from, to),
        getVoucherRevenueImpact(from, to),
      ]);
      setUsageSummary(summaryRes?.data || {});
      setTopVouchers(Array.isArray(topRes?.data) ? topRes.data : []);
      setRevenueImpact(revenueRes?.data || {});
    } catch (err) {
      toast.error(t("statistic.voucher_load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [from, to, limit]);

  return (
    <div className='bg-gray-50 min-h-screen p-8 space-y-8 overflow-y-auto h-full'>
      <Heading title={t("statistic.vouchers_report")} description='' keywords='' />
      <div>
        <h1 className='text-3xl font-semibold text-gray-800 mb-1'>{t("statistic.vouchers_report")}</h1>
        <p className='text-gray-500'>
          {t("statistic.vouchers_report_desc")}
        </p>
      </div>

      {/* Time filter */}
      <div className='bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-col md:flex-row justify-between items-center gap-4'>
        <div className='flex flex-wrap items-end gap-4 w-full md:w-auto'>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>{t("statistic.from_date")}</label>
            <input
              type='date'
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
            />
          </div>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>{t("statistic.to_date")}</label>
            <input
              type='date'
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
            />
          </div>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>{t("statistic.top_vouchers_label")}</label>
            <input
              type='number'
              min='1'
              max='100'
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className='border border-gray-300 rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-blue-500 outline-none'
            />
          </div>
        </div>
        <button
          onClick={fetchAll}
          className='bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition-all'
        >
          {t("statistic.refresh_data")}
        </button>
      </div>

      {loading ? (
        <div className='text-center py-10 text-gray-500'>{t("statistic.loading_data")}</div>
      ) : (
        <>
          {/* Usage overview */}
          <div>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t("statistic.usage_overview")}</h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
              <SummaryCard
                title={t("statistic.usage_count")}
                value={usageSummary?.requestedTimeFrameUsed || 0}
                color='#3b82f6'
                icon={<i className='fa-solid fa-ticket text-xl' />}
              />
              <SummaryCard
                title={t("statistic.vouchers_issued")}
                value={usageSummary?.totalIssued || 0}
                color='#10b981'
                icon={<i className='fa-solid fa-bullhorn text-xl' />}
              />
              <SummaryCard
                title={t("statistic.usage_rate")}
                value={`${usageSummary?.usageRate?.toFixed(1) || 0}%`}
                color='#f59e0b'
                icon={<i className='fa-solid fa-percent text-xl' />}
              />
            </div>
          </div>

          {/* Top vouchers */}
          <div>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t("statistic.top_vouchers_used", { limit })}</h3>
            {topVouchers.length === 0 ? (
              <div className='bg-white rounded-xl shadow-md border border-gray-100 p-5 text-gray-500 text-center'>
                {t("statistic.no_data")}
              </div>
            ) : (
              <div className='bg-white rounded-xl shadow-md border border-gray-100 p-5'>
                <table className='w-full text-sm text-left text-gray-700'>
                  <thead className='bg-gray-100 text-gray-600 uppercase text-xs'>
                    <tr>
                      <th className='px-4 py-2'>#</th>
                      <th className='px-4 py-2'>{t("statistic.voucher_code")}</th>
                      <th className='px-4 py-2 text-right'>{t("statistic.usage_count")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topVouchers.map((voucher, idx) => (
                      <tr key={voucher._id} className='border-b hover:bg-gray-50 transition'>
                        <td className='px-4 py-2 font-medium'>{idx + 1}</td>
                        <td className='px-4 py-2 font-semibold text-blue-600'>{voucher.code}</td>
                        <td className='px-4 py-2 text-right'>{voucher.usedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Revenue impact */}
          <div>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t("statistic.revenue_impact")}</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              <SummaryCard
                title={t("statistic.total_discount_amount")}
                value={`${(revenueImpact?.totalDiscountAmount || 0).toLocaleString()}₫`}
                color='#8b5cf6'
                icon={<i className='fa-solid fa-coins text-xl' />}
              />
              <SummaryCard
                title={t("statistic.avg_discount_ratio")}
                value={`${(revenueImpact?.discountRatio || 0).toLocaleString()}%`}
                color='#ef4444'
                icon={<i className='fa-solid fa-chart-pie text-xl' />}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default page;
