"use client";

import { useEffect, useState } from "react";
import { getReturningCustomerRate, getAverageSpendingPerOrder, getNewCustomers } from "@/service/statistic";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Users, DollarSign, RotateCcw } from "lucide-react";
import Heading from "@/components/Heading";
import { useTranslation } from "react-i18next";

const COLORS = ["#10b981", "#f87171"]; // Returning: green, New: red

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
  const { t } = useTranslation();
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
    { name: t("statistic.returning_customers"), value: returnRate },
    { name: t("statistic.new_customers"), value: 100 - returnRate },
  ];

  return (
    <div className='overflow-y-auto h-full p-6 bg-gradient-to-br from-gray-50 to-gray-100'>
      <Heading title={t("statistic.customers_report")} description='' keywords='' />
      <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>{t("statistic.customers_report")}</h2>

      {/* Overview */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8'>
        <SummaryCard
          title={t("statistic.returning_rate")}
          value={`${returnRate.toFixed(1)}%`}
          icon={RotateCcw}
          color='#10b981'
        />
        <SummaryCard
          title={t("statistic.avg_spending_per_order")}
          value={`${avgSpending.toLocaleString()}₫`}
          icon={DollarSign}
          color='#3b82f6'
        />
        <SummaryCard
          title={t("statistic.new_customers_month")}
          value={newCustomerStats.thisMonth.toLocaleString()}
          icon={Users}
          color='#f59e0b'
        />
      </div>

      {/* Pie Chart */}
      <div className='bg-white rounded-2xl shadow-md p-6 mb-8'>
        <h3 className='text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2'>{t("statistic.returning_rate")}</h3>
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

      {/* New customer detail stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
        <SummaryCard
          title={t("statistic.new_customers_today")}
          value={newCustomerStats.today.toLocaleString()}
          icon={Users}
          color='#06b6d4'
        />
        <SummaryCard
          title={t("statistic.new_customers_this_week")}
          value={newCustomerStats.thisWeek.toLocaleString()}
          icon={Users}
          color='#8b5cf6'
        />
        <SummaryCard
          title={t("statistic.new_customers_this_month")}
          value={newCustomerStats.thisMonth.toLocaleString()}
          icon={Users}
          color='#f43f5e'
        />
      </div>
    </div>
  );
};

export default CustomerInsightPage;
