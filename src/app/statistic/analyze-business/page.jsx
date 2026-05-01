"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Bar,
} from "recharts";
import { FaChartArea } from "react-icons/fa";
import { analyzeBusinessResult } from "@/service/statistic";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useTranslation } from "react-i18next";

const DashboardPage = () => {
  const { t } = useTranslation();
  dayjs.extend(isoWeek);

  const [analysis, setAnalysis] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [decomposition, setDecomposition] = useState(null);
  const [insightMessages, setInsightMessages] = useState([]);

  const [viewType, setViewType] = useState("day");
  const [week, setWeek] = useState(dayjs().isoWeek());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [monthMode, setMonthMode] = useState("day"); // 'day' or 'week'
  const [year, setYear] = useState(dayjs().year());
  const [day, setDay] = useState(dayjs().format("DD")); // day of month (1-31)

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
    revenue: item.revenue,
    profit: item.profit,
    predictedRevenue: forecast?.predictedRevenueSeries?.[idx] ?? null,
    predictedProfit: forecast?.predictedProfitSeries?.[idx] ?? null,
  }));

  // decompositionChartData: map decomposition arrays to objects safely
  const decompositionChartData =
    decomposition && analysis.length
      ? analysis.map((a, i) => ({
          date:
            viewType === "hour"
              ? (() => {
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
    const daysInMonth = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).daysInMonth();
    if (Number(day) > daysInMonth) setDay(String(daysInMonth));
  }, [month, year]);

  let trendMean = 0;
  let seasonalAmplitude = 0;
  let seasonalStrength = t("statistic.seasonal_weak");

  if (decomposition && analysis.length > 1) {
    const diffs = [];
    for (let i = 1; i < decomposition.trend.length; i++) {
      const prev = decomposition.trend[i - 1] ?? 0;
      const curr = decomposition.trend[i] ?? 0;
      diffs.push(curr - prev);
    }
    trendMean = diffs.reduce((a, b) => a + b, 0) / diffs.length;

    const seasonalVals = decomposition.seasonal.filter((v) => typeof v === "number");
    if (seasonalVals.length > 0) {
      const maxVal = Math.max(...seasonalVals);
      const minVal = Math.min(...seasonalVals);
      seasonalAmplitude = maxVal - minVal;
      seasonalStrength = seasonalAmplitude > 0.1 * (Math.max(...analysis.map((a) => a.revenue)) || 1)
        ? t("statistic.seasonal_strong")
        : t("statistic.seasonal_weak");
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
        label: t("statistic.forecast_label"),
        revenue: forecast.predictedRevenue,
        profit: forecast.predictedProfit,
        isForecast: true,
      },
      {
        label: t("statistic.scenario_label"),
        revenue: scenarioRevenue,
        profit: scenarioProfit,
        isScenario: true,
      },
    ]);
  };

  return (
    <div className='overflow-y-scroll h-full'>
      <Box p={3}>
        <Typography variant='h4' fontWeight='bold' gutterBottom>
          {t("statistic.analyze_business")}
        </Typography>

        {/* --- Introduction & analysis --- */}
        <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: "#f5f7fa" }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              {t("statistic.analysis_intro_title")}
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
              {t("statistic.analysis_intro_desc")}
            </Typography>
            <ul style={{ marginTop: 0 }}>
              <li>
                <b>Trend</b> – {t("statistic.trend_desc")}
              </li>
              <li>
                <b>Seasonality</b> – {t("statistic.seasonality_desc")}
              </li>
              <li>
                <b>Residual</b> – {t("statistic.residual_desc")}
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* ===== Time filter + Analyze button ===== */}
        <Card sx={{ borderRadius: 3, mb: 4, boxShadow: 3, backgroundColor: "#fff" }}>
          <CardContent>
            <Box display='flex' flexWrap='wrap' gap={3} alignItems='center'>
              {/* View mode selector */}
              <FormControl size='medium' sx={{ minWidth: 160 }}>
                <InputLabel>{t("statistic.view_mode")}</InputLabel>
                <Select value={viewType} label={t("statistic.view_mode")} onChange={(e) => setViewType(e.target.value)}>
                  <MenuItem value='day'>{t("statistic.day")}</MenuItem>
                  <MenuItem value='week'>{t("statistic.week")}</MenuItem>
                  <MenuItem value='month'>{t("statistic.month")}</MenuItem>
                  <MenuItem value='year'>{t("statistic.year")}</MenuItem>
                </Select>
              </FormControl>

              {/* Sub-selectors */}
              {viewType !== "year" && (
                <>
                  {viewType === "day" && (
                    <TextField
                      label={t("statistic.select_day")}
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
                      size='small'
                    />
                  )}
                  {viewType === "week" && (
                    <FormControl size='medium' sx={{ minWidth: 120 }}>
                      <InputLabel>{t("statistic.week")}</InputLabel>
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
                            {t("statistic.week")} {w}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {viewType === "month" && (
                    <>
                      <FormControl size='medium' sx={{ minWidth: 120 }}>
                        <InputLabel>{t("statistic.month")}</InputLabel>
                        <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <MenuItem key={m} value={m}>
                              {t("statistic.month")} {m}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl size='medium' sx={{ minWidth: 160 }}>
                        <InputLabel>{t("statistic.display_mode")}</InputLabel>
                        <Select value={monthMode} onChange={(e) => setMonthMode(e.target.value)}>
                          <MenuItem value='day'>{t("statistic.by_day")}</MenuItem>
                          <MenuItem value='week'>{t("statistic.by_week")}</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}
                  <FormControl size='medium' sx={{ minWidth: 120 }}>
                    <InputLabel>{t("statistic.year")}</InputLabel>
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

              {/* Analyze button on the right */}
              <Box flex='1 1 auto' display='flex' justifyContent='flex-end'>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<FaChartArea />}
                  onClick={handleAnalyze}
                  disabled={loadingAnalysis}
                >
                  {loadingAnalysis ? <CircularProgress size={20} sx={{ color: "white" }} /> : t("statistic.analyze_data")}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ===== Scenario Simulation ===== */}
        <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: "#f5f7fa" }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              {t("statistic.scenario_simulation_title")}
            </Typography>
            <Box display='flex' flexWrap='wrap' gap={2} mt={2}>
              <TextField
                label={t("statistic.adjust_trend_percent")}
                type='number'
                value={trendChange}
                onChange={(e) => setTrendChange(Number(e.target.value))}
                size='small'
              />
              <TextField
                label={t("statistic.adjust_seasonality_percent")}
                type='number'
                value={seasonalChange}
                onChange={(e) => setSeasonalChange(Number(e.target.value))}
                size='small'
              />
              <TextField
                label={t("statistic.reduce_cost_percent")}
                type='number'
                value={costChange}
                onChange={(e) => setCostChange(Number(e.target.value))}
                size='small'
              />
              <Button variant='contained' color='secondary' onClick={handleScenario}>
                {t("statistic.create_scenario")}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* --- Revenue & profit chart --- */}
        {scenarioData.length > 0 && (
          <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                {t("statistic.revenue_profit_chart")}
              </Typography>

              {decomposition && (
                <Box mb={2} sx={{ backgroundColor: "#f0f7ff", borderRadius: 2, p: 2 }}>
                  <Typography variant='body1'>
                    <b>{t("statistic.trend_label")}:</b>{" "}
                    {trendMean > 0
                      ? t("statistic.trend_increasing")
                      : trendMean < 0
                      ? t("statistic.trend_decreasing")
                      : t("statistic.trend_stable")}
                  </Typography>
                  <Typography variant='body1'>
                    <b>{t("statistic.seasonality_label")}:</b> {seasonalStrength} ({t("statistic.fluctuation")} {seasonalAmplitude.toFixed(0)} ₫)
                  </Typography>
                </Box>
              )}

              {scenarioData.length > 0 && (
                <Box mt={2} sx={{ backgroundColor: "#fff8e1", borderRadius: 2, p: 2 }}>
                  <Typography variant='h6' gutterBottom>
                    {t("statistic.scenario_result")}
                  </Typography>
                  <Typography>
                    {t("statistic.expected_revenue_scenario")}: <b>{scenarioData.at(-1)?.revenue?.toLocaleString("vi-VN")}</b> ₫
                  </Typography>
                  <Typography>
                    {t("statistic.expected_profit_scenario")}: <b>{scenarioData.at(-1)?.profit?.toLocaleString("vi-VN")}</b> ₫
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
                  <Bar yAxisId='left' dataKey='revenue' name={t("statistic.revenue")} fill='#8884d8' />
                  <Bar yAxisId='left' dataKey='profit' name={t("statistic.profit")} fill='#82ca9d' />
                  {scenarioData.length > 0 && (
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      data={scenarioData}
                      stroke='#ff3b3b'
                      strokeDasharray='5 5'
                      name={t("statistic.scenario_revenue")}
                      dot={false}
                      yAxisId='left'
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* --- Decomposition chart --- */}
        {decomposition && decompositionChartData.length > 0 && (
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                {t("statistic.time_series_decomposition")}
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
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type='monotone' dataKey='trend' stroke='#8884d8' name='Trend' dot={false} />
                  <Line type='monotone' dataKey='seasonal' stroke='#82ca9d' name='Seasonality' dot={false} />
                  <Line type='monotone' dataKey='resid' stroke='#ff7f50' name='Residual' dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* --- Next period forecast --- */}
        {forecast && (
          <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                {t("statistic.next_period_forecast")}
              </Typography>
              <Typography>
                {t("statistic.expected_revenue")}: <b>{Number(forecast.predictedRevenue || 0).toLocaleString("vi-VN")}</b> ₫
              </Typography>
              <Typography>
                {t("statistic.expected_profit")}: <b>{Number(forecast.predictedProfit || 0).toLocaleString("vi-VN")}</b> ₫
              </Typography>
              <Typography>
                {t("statistic.avg_growth")}: <b>{forecast.avgGrowth || "-"}</b>
              </Typography>

              <ResponsiveContainer width='100%' height={350}>
                <LineChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='label' />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {/* Revenue */}
                  <Line type='monotone' dataKey='revenue' stroke='#8884d8' name={t("statistic.actual_revenue")} dot={false} />
                  <Line
                    type='monotone'
                    dataKey='predictedRevenue'
                    stroke='#ff3b3b'
                    strokeDasharray='5 5'
                    name={t("statistic.predicted_revenue")}
                    dot={false}
                  />

                  {/* Profit */}
                  <Line type='monotone' dataKey='profit' stroke='#82ca9d' name={t("statistic.actual_profit")} dot={false} />
                  <Line
                    type='monotone'
                    dataKey='predictedProfit'
                    stroke='#ff9900'
                    strokeDasharray='5 5'
                    name={t("statistic.predicted_profit")}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* --- Top selling dishes --- */}
        {topDishes.length > 0 && (
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                {t("statistic.top_selling_dishes")}
              </Typography>

              <ResponsiveContainer width='100%' height={300}>
                <ComposedChart data={topDishes}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='totalRevenue' fill='#8884d8' name={t("statistic.revenue_vnd")} />
                  <Line type='monotone' dataKey='totalOrders' stroke='#82ca9d' name={t("statistic.order_count")} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* --- Detailed dish insights --- */}
        {dishInsights.length > 0 && (
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3, backgroundColor: "#f5f7fa" }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                {t("statistic.dish_insights")}
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
