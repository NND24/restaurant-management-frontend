"use client";

import { useEffect, useState } from "react";
import { getReturningCustomerRate, getAverageSpendingPerOrder, getNewCustomers } from "@/service/statistic";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Users, DollarSign, RotateCcw } from "lucide-react";

const COLORS = ["#10b981", "#f87171"]; // Returning: green, New: red

// 🔹 Thẻ thống kê đẹp, có icon và màu sắc
function SummaryCard({ title, value, icon: Icon, color }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-5 border-t-4 transition-transform duration-200 hover:scale-[1.02]`}
      style={{ borderColor: color }}
    >
      <div className='flex items-center gap-3'>
        <div className='p-3 rounded-full' style={{ backgroundColor: `${color}22`, color }}>
          <Icon size={22} />
        </div>
        <div>
          <p className='text-sm text-gray-500 font-medium'>{title}</p>
          <p className='text-2xl font-semibold text-gray-800 mt-1'>{value}</p>
        </div>
      </div>
    </div>
  );
}

const CustomerInsightPage = () => {
  const [returnRate, setReturnRate] = useState(0);
  const [avgSpending, setAvgSpending] = useState(0);
  const [newCustomerStats, setNewCustomerStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rateRes, avgRes, newCusRes] = await Promise.all([
        getReturningCustomerRate(),
        getAverageSpendingPerOrder(),
        getNewCustomers(),
      ]);

      setReturnRate(rateRes?.data?.returningRate ?? 0);
      setAvgSpending(avgRes?.data?.averageSpending ?? 0);
      setNewCustomerStats({
        today: newCusRes?.data?.today ?? 0,
        thisWeek: newCusRes?.data?.thisWeek ?? 0,
        thisMonth: newCusRes?.data?.thisMonth ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch customer stats:", error);
    }
  };

  const returnChartData = [
    { name: "Khách quay lại", value: returnRate },
    { name: "Khách mới", value: 100 - returnRate },
  ];

  return (
    <div className='overflow-y-auto h-full p-6 bg-gradient-to-br from-gray-50 to-gray-100'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>Phân tích hành vi khách hàng</h2>

      {/* Tổng quan */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8'>
        <SummaryCard
          title='Tỷ lệ khách quay lại'
          value={`${returnRate.toFixed(1)}%`}
          icon={RotateCcw}
          color='#10b981'
        />
        <SummaryCard
          title='Chi tiêu trung bình / đơn'
          value={`${avgSpending.toLocaleString()}₫`}
          icon={DollarSign}
          color='#3b82f6'
        />
        <SummaryCard
          title='Khách mới (Tháng)'
          value={newCustomerStats.thisMonth.toLocaleString()}
          icon={Users}
          color='#f59e0b'
        />
      </div>

      {/* Biểu đồ Pie */}
      <div className='bg-white rounded-2xl shadow-md p-6 mb-8'>
        <h3 className='text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2'>Tỷ lệ khách quay lại</h3>
        <div className='w-full h-72'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={returnChartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius={110}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
              >
                {returnChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Thống kê chi tiết khách mới */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
        <SummaryCard
          title='Khách mới (Hôm nay)'
          value={newCustomerStats.today.toLocaleString()}
          icon={Users}
          color='#06b6d4'
        />
        <SummaryCard
          title='Khách mới (Tuần này)'
          value={newCustomerStats.thisWeek.toLocaleString()}
          icon={Users}
          color='#8b5cf6'
        />
        <SummaryCard
          title='Khách mới (Tháng này)'
          value={newCustomerStats.thisMonth.toLocaleString()}
          icon={Users}
          color='#f43f5e'
        />
      </div>
    </div>
  );
};

export default CustomerInsightPage;
