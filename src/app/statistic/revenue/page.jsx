"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { FaMoneyBillWave, FaCalendarWeek, FaChartLine } from "react-icons/fa";
import { getRevenueSummary, revenueByPeriod } from "@/service/statistic";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import CountUp from "react-countup";

const DashboardPage = () => {
  dayjs.extend(isoWeek);

  const [summary, setSummary] = useState({
    today: { revenue: 0, cost: 0, waste: 0, profit: 0, margin: 0 },
    week: { revenue: 0, cost: 0, waste: 0, profit: 0, margin: 0 },
    month: { revenue: 0, cost: 0, waste: 0, profit: 0, margin: 0 },
  });

  const [byDay, setByDay] = useState([]);
  const [viewType, setViewType] = useState("day");
  const [week, setWeek] = useState(dayjs().isoWeek());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [chartMetric, setChartMetric] = useState("all");
  const [analysis, setAnalysis] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    getRevenueSummary().then((res) => setSummary(res.data));
  }, []);

  useEffect(() => {
    revenueByPeriod({ period: viewType, month, year }).then((res) => setByDay(res.data));
  }, [viewType, week, month, year]);

  const summaryCards = [
    {
      label: "Hôm nay",
      data: summary.today,
      icon: <FaMoneyBillWave size={28} />,
      bg: "linear-gradient(135deg,#43cea2,#185a9d)",
    },
    {
      label: "Tuần này",
      data: summary.week,
      icon: <FaCalendarWeek size={28} />,
      bg: "linear-gradient(135deg,#ff9966,#ff5e62)",
    },
    {
      label: "Tháng này",
      data: summary.month,
      icon: <FaChartLine size={28} />,
      bg: "linear-gradient(135deg,#667eea,#764ba2)",
    },
  ];

  const forecastChartData = [
    ...analysis.map((a) => ({
      label: a.period,
      revenue: a.revenue,
      profit: a.profit,
    })),
    {
      label: "Dự đoán",
      revenue: forecast?.predictedRevenue || 0,
      profit: forecast?.predictedProfit || 0,
      isForecast: true,
    },
  ];

  const chartData = byDay.map((d) => ({
    label: d.label || d.date || d.month || d.year,
    revenue: d.revenue,
    cost: d.cost,
    waste: d.wasteCost,
    profit: d.profit,
    margin: d.margin,
  }));

  return (
    <div className='overflow-y-scroll h-full'>
      <Box p={3}>
        <Typography variant='h4' fontWeight='bold' gutterBottom>
          Báo cáo doanh thu & lợi nhuận
        </Typography>

        {/* Tổng quan */}
        <Box display='flex' gap={3} flexWrap='wrap' mb={4}>
          {summaryCards.map((s, i) => (
            <Card
              key={i}
              sx={{
                background: s.bg,
                color: "white",
                borderRadius: 3,
                boxShadow: 4,
                width: 330,
                flexShrink: 0,
              }}
            >
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  {s.icon}
                  <Box>
                    <Typography variant='h6'>{s.label}</Typography>
                    <Typography>
                      Doanh thu: <CountUp end={s.data.revenue} separator=',' /> ₫
                    </Typography>
                    <Typography>
                      Lợi nhuận: <CountUp end={s.data.profit} separator=',' /> ₫
                    </Typography>
                    <Typography>Tỷ suất: {s.data.margin.toFixed(1)}%</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Bộ lọc */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2, backgroundColor: "#fff" }}>
          <CardContent>
            <Box display='flex' gap={3} flexWrap='wrap' alignItems='center'>
              <FormControl size='medium' sx={{ minWidth: 140 }}>
                <InputLabel>Chế độ xem</InputLabel>
                <Select value={viewType} label='Chế độ xem' onChange={(e) => setViewType(e.target.value)}>
                  <MenuItem value='day'>Ngày</MenuItem>
                  <MenuItem value='week'>Tuần</MenuItem>
                  <MenuItem value='month'>Tháng</MenuItem>
                  <MenuItem value='year'>Năm</MenuItem>
                </Select>
              </FormControl>

              {viewType !== "year" && (
                <>
                  {viewType === "week" && (
                    <FormControl size='medium' sx={{ minWidth: 120 }}>
                      <InputLabel>Tuần</InputLabel>
                      <Select value={week} onChange={(e) => setWeek(Number(e.target.value))}>
                        {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                          <MenuItem key={w} value={w}>
                            Tuần {w}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {viewType !== "week" && (
                    <FormControl size='medium' sx={{ minWidth: 120 }}>
                      <InputLabel>Tháng</InputLabel>
                      <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <MenuItem key={m} value={m}>
                            Tháng {m}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <FormControl size='medium' sx={{ minWidth: 120 }}>
                    <InputLabel>Năm</InputLabel>
                    <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                      {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Biểu đồ doanh thu & lợi nhuận */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6'>
                📊 Biểu đồ theo{" "}
                {viewType === "day" ? "ngày" : viewType === "week" ? "tuần" : viewType === "month" ? "tháng" : "năm"}
              </Typography>
              <FormControl size='small' sx={{ minWidth: 160 }}>
                <InputLabel>Hiển thị</InputLabel>
                <Select value={chartMetric} onChange={(e) => setChartMetric(e.target.value)}>
                  <MenuItem value='all'>Tất cả</MenuItem>
                  <MenuItem value='revenue'>Doanh thu</MenuItem>
                  <MenuItem value='cost'>Chi phí</MenuItem>
                  <MenuItem value='waste'>Hao hụt</MenuItem>
                  <MenuItem value='profit'>Lợi nhuận</MenuItem>
                  <MenuItem value='margin'>Tỷ suất (%)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <ResponsiveContainer width='100%' height={350}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='label' />
                <YAxis yAxisId='left' />
                <YAxis yAxisId='right' orientation='right' />
                <Tooltip />
                <Legend />
                {(chartMetric === "all" || chartMetric === "revenue") && (
                  <Bar yAxisId='left' dataKey='revenue' name='Doanh thu' fill='#8884d8' />
                )}
                {(chartMetric === "all" || chartMetric === "cost") && (
                  <Bar yAxisId='left' dataKey='cost' name='Chi phí' fill='#82ca9d' />
                )}
                {(chartMetric === "all" || chartMetric === "waste") && (
                  <Bar yAxisId='left' dataKey='waste' name='Hao hụt' fill='#ffc658' />
                )}
                {(chartMetric === "all" || chartMetric === "profit") && (
                  <Bar yAxisId='left' dataKey='profit' name='Lợi nhuận' fill='#ff7f50' />
                )}
                {(chartMetric === "all" || chartMetric === "margin") && (
                  <Line yAxisId='right' type='monotone' dataKey='margin' stroke='#000' name='Tỷ suất (%)' dot={false} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default DashboardPage;
