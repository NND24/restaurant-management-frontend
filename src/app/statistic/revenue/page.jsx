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
  TextField,
  Button,
  CircularProgress,
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
import { FaMoneyBillWave, FaCalendarWeek, FaChartLine, FaChartArea } from "react-icons/fa";
import { getRevenueSummary, revenueByPeriod, analyzeBusinessResult } from "@/service/statistic";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import CountUp from "react-countup";
import Heading from "../../../components/Heading";

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

  const [day, setDay] = useState(dayjs().format("DD")); // day of month (1-31)
  const [monthMode, setMonthMode] = useState("day"); // 'day' hoặc 'week'

  const [chartMetric, setChartMetric] = useState("all");
  const [analysis, setAnalysis] = useState([]);
  const [forecast, setForecast] = useState(null);

  const [decomposition, setDecomposition] = useState(null);
  const [insightMessages, setInsightMessages] = useState([]);

  const [trendChange, setTrendChange] = useState(0);
  const [scenarioData, setScenarioData] = useState([]);
  const [seasonalChange, setSeasonalChange] = useState(0);
  const [costChange, setCostChange] = useState(0);
  const [topDishes, setTopDishes] = useState([]);
  const [dishInsights, setDishInsights] = useState([]);

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Build request params and call backend
  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    try {
      const params = {
        period: viewType,
        scenario: {
          trendChange,
          seasonalChange,
          costChange,
        },
      };
      if (viewType === "week") {
        params.week = week;
        params.year = year;
      } else if (viewType === "month") {
        params.month = month;
        params.year = year;
        params.groupBy = monthMode;
      } else if (viewType === "day") {
        const paddedMonth = String(month).padStart(2, "0");
        const paddedDay = String(day).padStart(2, "0");
        params.date = `${year}-${paddedMonth}-${paddedDay}`;
      } else if (viewType === "year") {
        params.year = year;
      }

      const res = await analyzeBusinessResult(params);
      const data = res.data || {};
      setAnalysis(data.analysis || []);
      setForecast(data.forecast || null);
      setDecomposition(data.decomposition || null);
      setInsightMessages(data.insightMessages || []);
      setTopDishes(data.topDishes || []);
      setDishInsights(data.dishInsights || []);

      setScenarioData([]);
    } catch (err) {
      console.error("Lỗi khi phân tích:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const forecastChartData = analysis.map((item, idx) => ({
    label: item.period,
    revenue: item.revenue, // thực tế
    profit: item.profit,
    predictedRevenue: forecast?.predictedRevenueSeries?.[idx] ?? null, // dự đoán
    predictedProfit: forecast?.predictedProfitSeries?.[idx] ?? null,
  }));

  // decompositionChartData: map decomposition arrays to objects safely
  const decompositionChartData =
    decomposition && analysis.length
      ? analysis.map((a, i) => ({
          date:
            viewType === "hour"
              ? // format period to HH:mm if possible
                (() => {
                  try {
                    const p = dayjs(a.period);
                    return p.isValid() ? p.format("HH:mm") : String(a.period).slice(11, 16);
                  } catch {
                    return a.period;
                  }
                })()
              : a.period,
          trend: decomposition.trend && decomposition.trend[i] != null ? decomposition.trend[i] : 0,
          seasonal: decomposition.seasonal && decomposition.seasonal[i] != null ? decomposition.seasonal[i] : 0,
          resid: decomposition.resid && decomposition.resid[i] != null ? decomposition.resid[i] : 0,
        }))
      : [];

  // convenience: sync a default day when month/year change
  useEffect(() => {
    // ensure day is valid in month
    const daysInMonth = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).daysInMonth();
    if (Number(day) > daysInMonth) setDay(String(daysInMonth));
  }, [month, year]);

  let trendMean = 0;
  let seasonalAmplitude = 0;
  let seasonalStrength = "yếu";

  if (decomposition && analysis.length > 1) {
    // 1️⃣ Tính trung bình độ dốc của trend
    const diffs = [];
    for (let i = 1; i < decomposition.trend.length; i++) {
      const prev = decomposition.trend[i - 1] ?? 0;
      const curr = decomposition.trend[i] ?? 0;
      diffs.push(curr - prev);
    }
    trendMean = diffs.reduce((a, b) => a + b, 0) / diffs.length;

    // 2️⃣ Độ dao động mùa vụ
    const seasonalVals = decomposition.seasonal.filter((v) => typeof v === "number");
    if (seasonalVals.length > 0) {
      const maxVal = Math.max(...seasonalVals);
      const minVal = Math.min(...seasonalVals);
      seasonalAmplitude = maxVal - minVal;
      seasonalStrength = seasonalAmplitude > 0.1 * (Math.max(...analysis.map((a) => a.revenue)) || 1) ? "mạnh" : "yếu";
    }
  }

  const handleScenario = () => {
    if (!forecast) return;

    const trendFactor = 1 + trendChange / 100;
    const seasonalFactor = 1 + seasonalChange / 100;
    const costFactor = 1 - costChange / 100;

    const scenarioRevenue = forecast.predictedRevenue * trendFactor * seasonalFactor;
    const scenarioProfit = scenarioRevenue - (forecast.predictedRevenue - forecast.predictedProfit) * costFactor;

    const baseData = [...forecastChartData.filter((d) => !d.isScenario && !d.isForecast)];

    setScenarioData([
      ...baseData,
      {
        label: "Dự đoán",
        revenue: forecast.predictedRevenue,
        profit: forecast.predictedProfit,
        isForecast: true,
      },
      {
        label: "Kịch bản giả lập",
        revenue: scenarioRevenue,
        profit: scenarioProfit,
        isScenario: true,
      },
    ]);
  };

  useEffect(() => {
    getRevenueSummary().then((res) => setSummary(res.data));
  }, []);

  useEffect(() => {
    const fetchRevenueByPeriod = async () => {
      try {
        const params = { period: viewType };

        if (viewType === "week") {
          params.week = week;
          params.year = year;
        } else if (viewType === "month") {
          params.month = month;
          params.year = year;
          params.groupBy = monthMode;
        } else if (viewType === "day") {
          const paddedMonth = String(month).padStart(2, "0");
          const paddedDay = String(day).padStart(2, "0");
          params.date = `${year}-${paddedMonth}-${paddedDay}`;
        } else if (viewType === "year") {
          params.year = year;
        }

        const res = await revenueByPeriod(params);
        setByDay(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu revenueByPeriod:", error);
      }
    };

    fetchRevenueByPeriod();
  }, [viewType, week, month, year, day, monthMode]);

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
      <Heading title='Báo cáo doanh thu & lợi nhuận' description='' keywords='' />
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
            <Box display='flex' flexWrap='wrap' gap={3} alignItems='center'>
              {/* Chọn chế độ xem */}
              <FormControl size='medium' sx={{ minWidth: 160 }}>
                <InputLabel>Chế độ xem</InputLabel>
                <Select value={viewType} label='Chế độ xem' onChange={(e) => setViewType(e.target.value)}>
                  <MenuItem value='day'>Ngày</MenuItem>
                  <MenuItem value='week'>Tuần</MenuItem>
                  <MenuItem value='month'>Tháng</MenuItem>
                  <MenuItem value='year'>Năm</MenuItem>
                </Select>
              </FormControl>

              {/* Các bộ chọn phụ thuộc chế độ xem */}
              {viewType !== "year" && (
                <>
                  {viewType === "day" && (
                    <TextField
                      label='Chọn ngày'
                      type='date'
                      value={dayjs(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`).format(
                        "YYYY-MM-DD"
                      )}
                      onChange={(e) => {
                        const d = dayjs(e.target.value);
                        if (!d.isValid()) return;
                        setMonth(d.month() + 1);
                        setYear(d.year());
                        setDay(d.date());
                      }}
                      InputLabelProps={{ shrink: true }}
                      size='medium'
                    />
                  )}
                  {viewType === "week" && (
                    <FormControl size='medium' sx={{ minWidth: 120 }}>
                      <InputLabel>Tuần</InputLabel>
                      <Select
                        value={week}
                        onChange={(e) => setWeek(Number(e.target.value))}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 250,
                            },
                          },
                        }}
                      >
                        {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                          <MenuItem key={w} value={w}>
                            Tuần {w}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {viewType === "month" && (
                    <>
                      <FormControl size='medium' sx={{ minWidth: 120 }}>
                        <InputLabel>Tháng</InputLabel>
                        <Select
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 250,
                              },
                            },
                          }}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <MenuItem key={m} value={m}>
                              Tháng {m}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl size='medium' sx={{ minWidth: 160 }}>
                        <InputLabel>Chế độ hiển thị</InputLabel>
                        <Select value={monthMode} onChange={(e) => setMonthMode(e.target.value)}>
                          <MenuItem value='day'>Theo ngày</MenuItem>
                          <MenuItem value='week'>Theo tuần</MenuItem>
                        </Select>
                      </FormControl>
                    </>
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

              {/* Nút Phân tích nằm bên phải */}
              <Box flex='1 1 auto' display='flex' justifyContent='flex-end'></Box>
            </Box>
          </CardContent>
        </Card>

        {/* Biểu đồ doanh thu & lợi nhuận */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6'>
                Biểu đồ theo{" "}
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

        {/* --- Phần hướng dẫn & phân tích --- */}
        <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: "#ffffff" }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Giới thiệu phân tích
            </Typography>

            <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
              Hệ thống sử dụng kỹ thuật <b>Time Series Decomposition</b> để phân tích dữ liệu doanh thu theo thời gian.
              Mục tiêu của phân tích này là giúp bạn hiểu rõ:
              <br />– Doanh thu đang thay đổi theo xu hướng nào?
              <br />– Có xuất hiện các mẫu lặp lại theo ngày/tuần/tháng hay không?
              <br />– Phần biến động nào là bất thường và không thể dự đoán trước?
            </Typography>

            <ul style={{ marginTop: 0 }}>
              <li>
                <b>Trend (Xu hướng)</b> – thể hiện chiều hướng thay đổi của doanh thu trong thời gian dài.
                <br />
                Ví dụ: Doanh thu đang tăng dần qua các tháng, hay giảm dần?
              </li>

              <li style={{ marginTop: 8 }}>
                <b>Seasonality (Tính mùa vụ)</b> – các mẫu lặp lại theo chu kỳ, thường do thói quen khách hàng.
                <br />
                Ví dụ: Cuối tuần doanh thu tăng, giữa tuần giảm; mùa lễ hội doanh thu tăng mạnh,...
              </li>

              <li style={{ marginTop: 8 }}>
                <b>Residual (Nhiễu / sai lệch ngẫu nhiên)</b> – phần biến động không nằm trong xu hướng hoặc mùa vụ.
                <br />
                Đây thường là những yếu tố bất thường: thời tiết xấu, sự kiện đột xuất, lỗi hệ thống, hoặc dao động tự
                nhiên.
              </li>
            </ul>

            <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
              Việc phân tích ba thành phần này giúp chủ cửa hàng nhìn rõ nguyên nhân biến động doanh thu và đưa ra quyết
              định kinh doanh chính xác hơn.
            </Typography>

            <Button
              variant='contained'
              color='primary'
              startIcon={<FaChartArea />}
              onClick={handleAnalyze}
              disabled={loadingAnalysis}
            >
              {loadingAnalysis ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Phân tích dữ liệu"}
            </Button>
          </CardContent>
        </Card>

        {/* ===== Scenario Simulation (tách riêng) ===== */}
        <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: "#ffffff" }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Giả lập kịch bản
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
              Tính năng <b>giả lập kịch bản</b> cho phép bạn thử thay đổi một số yếu tố quan trọng và xem hệ thống dự
              đoán doanh thu – lợi nhuận sẽ thay đổi như thế nào. Đây là công cụ hữu ích giúp chủ cửa hàng lập kế hoạch
              kinh doanh và kiểm tra các tình huống “nếu… thì sao?” mà không ảnh hưởng tới dữ liệu thật.
              <br />
              <br />
              Bạn có thể điều chỉnh 3 thành phần:
              <ul style={{ marginTop: 4 }}>
                <li>
                  <b>% Điều chỉnh Trend</b> – mô phỏng việc doanh thu tăng/giảm dài hạn.
                  <br />
                  Ví dụ: tăng 10% để xem nếu cửa hàng quảng bá tốt hơn thì ảnh hưởng ra sao.
                </li>

                <li style={{ marginTop: 8 }}>
                  <b>% Điều chỉnh Seasonality</b> – mô phỏng việc thay đổi theo mùa vụ.
                  <br />
                  Ví dụ: mùa lễ hội nhu cầu tăng mạnh → tăng 20% để xem doanh thu khả năng tăng bao nhiêu.
                </li>

                <li style={{ marginTop: 8 }}>
                  <b>% Giảm chi phí</b> – mô phỏng việc tối ưu chi phí vận hành.
                  <br />
                  Ví dụ: giảm 5% chi phí nguyên liệu để xem lợi nhuận có cải thiện như thế nào.
                </li>
              </ul>
              Sau khi nhập các thay đổi, nhấn nút <b>“Tạo kịch bản giả lập”</b> để hệ thống sinh ra kết quả dự đoán cho
              kịch bản bạn muốn thử nghiệm.
            </Typography>

            <Box display='flex' flexWrap='wrap' gap={2} mt={2}>
              <TextField
                label='% Điều chỉnh Trend'
                type='number'
                value={trendChange}
                onChange={(e) => setTrendChange(Number(e.target.value))}
                size='small'
              />
              <TextField
                label='% Điều chỉnh Seasonality'
                type='number'
                value={seasonalChange}
                onChange={(e) => setSeasonalChange(Number(e.target.value))}
                size='small'
              />
              <TextField
                label='% Giảm chi phí'
                type='number'
                value={costChange}
                onChange={(e) => setCostChange(Number(e.target.value))}
                size='small'
              />
              <Button variant='contained' color='secondary' onClick={handleScenario}>
                Tạo kịch bản giả lập
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* --- Biểu đồ doanh thu & lợi nhuận --- */}
        {scenarioData.length > 0 && (
          <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Biểu đồ doanh thu & lợi nhuận
              </Typography>

              {decomposition && (
                <Box mb={2} sx={{ backgroundColor: "#f0f7ff", borderRadius: 2, p: 2 }}>
                  <Typography variant='body1'>
                    <b>Xu hướng:</b> {trendMean > 0 ? "Đang tăng" : trendMean < 0 ? "Đang giảm" : "Ổn định"}
                  </Typography>
                  <Typography variant='body1'>
                    <b>Tính mùa vụ:</b> {seasonalStrength} (dao động {seasonalAmplitude.toFixed(0)} ₫)
                  </Typography>
                </Box>
              )}

              {scenarioData.length > 0 && (
                <Box mt={2} sx={{ backgroundColor: "#fff8e1", borderRadius: 2, p: 2 }}>
                  <Typography variant='h6' gutterBottom>
                    Kết quả giả lập
                  </Typography>
                  <Typography>
                    Doanh thu dự kiến (kịch bản): <b>{scenarioData.at(-1)?.revenue?.toLocaleString("vi-VN")}</b> ₫
                  </Typography>
                  <Typography>
                    Lợi nhuận dự kiến (kịch bản): <b>{scenarioData.at(-1)?.profit?.toLocaleString("vi-VN")}</b> ₫
                  </Typography>
                </Box>
              )}

              <ResponsiveContainer width='100%' height={350}>
                <ComposedChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='label' />
                  <YAxis yAxisId='left' />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId='left' dataKey='revenue' name='Doanh thu' fill='#8884d8' />
                  <Bar yAxisId='left' dataKey='profit' name='Lợi nhuận' fill='#82ca9d' />
                  {/* Scenario line if any */}
                  {scenarioData.length > 0 && (
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      data={scenarioData}
                      stroke='#ff3b3b'
                      strokeDasharray='5 5'
                      name='Kịch bản (Doanh thu)'
                      dot={false}
                      yAxisId='left'
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* --- Biểu đồ decomposition --- */}
        {decomposition && decompositionChartData.length > 0 && (
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Phân tích thành phần thời gian
              </Typography>

              <Box display='flex' flexWrap='wrap' gap={1}>
                {insightMessages.map((msg, i) => (
                  <Box
                    key={i}
                    sx={{
                      backgroundColor: "#e3f2fd",
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    {msg}
                  </Box>
                ))}
              </Box>

              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={decompositionChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />

                  <YAxis
                    label={{
                      value: "Điểm chỉ số",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />

                  <Tooltip
                    formatter={(value, name) => {
                      const formatted = Number(value).toLocaleString("vi-VN");

                      if (name === "Residual") {
                        return [formatted, name]; // KHÔNG gắn đơn vị
                      }

                      return [`${formatted} đ`, name]; // trend + seasonal có đơn vị
                    }}
                  />

                  <Legend />

                  <Line type='monotone' dataKey='trend' stroke='#8884d8' name='Trend' dot={false} />
                  <Line type='monotone' dataKey='seasonal' stroke='#82ca9d' name='Seasonality' dot={false} />
                  <Line type='monotone' dataKey='resid' stroke='#ff7f50' name='Residual' dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* --- Dự đoán kỳ tới & Scenario --- */}
        {forecast && (
          <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Dự đoán kỳ tới
              </Typography>
              <Typography>
                Doanh thu dự kiến: <b>{Number(forecast.predictedRevenue || 0).toLocaleString("vi-VN")}</b> ₫
              </Typography>
              <Typography>
                Lợi nhuận dự kiến: <b>{Number(forecast.predictedProfit || 0).toLocaleString("vi-VN")}</b> ₫
              </Typography>
              <Typography>
                Tăng trưởng trung bình: <b>{forecast.avgGrowth || "-"}</b>
              </Typography>

              <ResponsiveContainer width='100%' height={350}>
                <LineChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='label' />

                  {/* Trục Y có đơn vị tiền */}
                  <YAxis
                    tickFormatter={(value) => `${value.toLocaleString("vi-VN")} ₫`}
                    label={{ value: "Đơn vị: ₫", angle: -90, position: "insideLeft" }}
                  />

                  {/* Tooltip có định dạng tiền */}
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString("vi-VN")} ₫`} />

                  <Legend />

                  {/* Doanh thu */}
                  <Line type='monotone' dataKey='revenue' stroke='#8884d8' name='Doanh thu thực tế' dot={false} />
                  <Line
                    type='monotone'
                    dataKey='predictedRevenue'
                    stroke='#ff3b3b'
                    strokeDasharray='5 5'
                    name='Doanh thu dự đoán'
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* --- Món ăn bán chạy --- */}
        {topDishes.length > 0 && (
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Top món ăn bán chạy
              </Typography>

              <ResponsiveContainer width='100%' height={300}>
                <ComposedChart data={topDishes}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='totalRevenue' fill='#8884d8' name='Doanh thu (₫)' />
                  <Line type='monotone' dataKey='totalOrders' stroke='#82ca9d' name='Số đơn hàng' dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* --- Nhận định chi tiết theo món --- */}
        {dishInsights.length > 0 && (
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3, backgroundColor: "#f5f7fa" }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Nhận định chi tiết theo món
              </Typography>
              <Box display='flex' flexDirection='column' gap={1}>
                {dishInsights.map((msg, i) => (
                  <Box
                    key={i}
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      boxShadow: 1,
                      borderLeft: "4px solid #2196f3",
                    }}
                  >
                    {msg}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </div>
  );
};

export default DashboardPage;
