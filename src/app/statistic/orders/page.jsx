"use client";

import { useState, useEffect } from "react";
import {
  getOrderSummaryStats,
  getOrderStatusRate,
  getOrdersOverTime,
  getOrderStatusDistribution,
  getOrdersByTimeSlot,
} from "@/service/statistic";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import DateRangePicker from "@/components/DateRangePicker";
import dayjs from "dayjs";
import { FaCalendarWeek, FaChartLine, FaMoneyBillWave } from "react-icons/fa";

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  finished: "Đã hoàn tất",
  taken: "Đã lấy món",
  delivering: "Đang giao",
  delivered: "Đã giao",
  done: "Hoàn thành",
  cancelled: "Đã huỷ",
};

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  finished: "#10b981",
  taken: "#6366f1",
  delivering: "#0ea5e9",
  delivered: "#22c55e",
  done: "#16a34a",
  cancelled: "#ef4444",
};

const PIE_COLORS = ["#22c55e", "#ef4444"];

function SummaryCard({ title, count, color, icon }) {
  return (
    <div className='flex items-center justify-between bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100'>
      <div>
        <p className='text-sm text-gray-500'>{title}</p>
        <p className='text-2xl font-semibold text-gray-800 mt-1'>{count.toLocaleString("vi-VN")}</p>
      </div>
      <div
        className='w-12 h-12 flex items-center justify-center rounded-full text-white shadow-md'
        style={{ background: color }}
      >
        {icon}
      </div>
    </div>
  );
}

const page = () => {
  const [summary, setSummary] = useState(null);
  const [statusRate, setStatusRate] = useState(null);
  const [overTimeData, setOverTimeData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState(null);
  const [timeSlotData, setTimeSlotData] = useState([]);
  const [fromDate, setFromDate] = useState(dayjs().subtract(6, "day").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));

  const fetchAllData = async () => {
    try {
      const [sum, rate, timeSlot] = await Promise.all([
        getOrderSummaryStats(),
        getOrderStatusRate(),
        getOrdersByTimeSlot(),
      ]);
      setSummary(sum.data);
      setStatusRate(rate.data);
      setTimeSlotData(timeSlot.data);

      if (fromDate && toDate) {
        const [time, dist] = await Promise.all([
          getOrdersOverTime(fromDate, toDate),
          getOrderStatusDistribution(fromDate, toDate),
        ]);
        setOverTimeData(Array.isArray(time.data) ? time.data : []);
        setStatusDistribution(dist.data);
      }
    } catch (err) {
      console.error("❌ Order tab fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [fromDate, toDate]);

  const barChartData = statusDistribution
    ? Object.entries(statusDistribution).map(([key, value]) => ({
        status: STATUS_LABELS[key] || key,
        value,
        fill: STATUS_COLORS[key] || "#a3a3a3",
      }))
    : [];

  const pieChartData = statusRate
    ? Object.entries(statusRate).map(([key, value]) => ({
        name: key === "completed" ? "Đã hoàn tất" : "Đã huỷ",
        value,
      }))
    : [];

  return (
    <div className='p-8 bg-gray-50 min-h-screen space-y-8 overflow-y-auto h-full'>
      <h1 className='text-3xl font-semibold text-gray-800 mb-2'>Thống kê đơn hàng</h1>

      {/* Summary Cards */}
      {summary && (
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
          <SummaryCard title='Hôm nay' count={summary.today} color='#3b82f6' icon={<FaMoneyBillWave size={28} />} />
          <SummaryCard title='Tuần này' count={summary.thisWeek} color='#10b981' icon={<FaCalendarWeek size={28} />} />
          <SummaryCard title='Tháng này' count={summary.thisMonth} color='#f59e0b' icon={<FaChartLine size={28} />} />
        </div>
      )}

      {/* Date Filter */}
      <div className='bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-col md:flex-row justify-between items-center gap-3'>
        <h3 className='text-lg font-medium text-gray-700'>Chọn khoảng thời gian</h3>
        <DateRangePicker
          from={fromDate}
          to={toDate}
          onChange={({ from, to }) => {
            setFromDate(from);
            setToDate(to);
          }}
        />
      </div>

      {/* Orders Over Time */}
      <div className='bg-white rounded-xl shadow-md border border-gray-100 p-6'>
        <h3 className='text-lg font-semibold mb-3 text-gray-800'>Đơn hàng theo thời gian</h3>
        <div className='w-full h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={overTimeData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Line type='monotone' dataKey='orders' stroke='#2563eb' strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie + Bar chart */}
      {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow-md border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold mb-3 text-gray-800'>Tỷ lệ hoàn tất vs huỷ</h3>
          <ResponsiveContainer width='100%' height={280}>
            <PieChart>
              <Pie data={pieChartData} dataKey='value' outerRadius={100} label>
                {pieChartData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-white rounded-xl shadow-md border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold mb-3 text-gray-800'>Phân phối trạng thái đơn</h3>
          <ResponsiveContainer width='100%' height={280}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='status' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='value' name='Số đơn'>
                {barChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {/* Orders by Time Slot */}
      {timeSlotData && timeSlotData.length > 0 && (
        <div className='bg-white rounded-xl shadow-md border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold mb-3 text-gray-800'>Đơn hàng theo khung giờ</h3>
          <div className='w-full h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis dataKey='timeSlot' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='orders' name='Số đơn' fill='#8b5cf6' radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
