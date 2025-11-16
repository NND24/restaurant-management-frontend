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
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Tooltip,
  Grid,
  TextField,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Tooltip as RechartsTooltip,
  Cell,
  Legend,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import {
  getRevenueByItem,
  getRevenueByDishGroup,
  getRecommendedDishes,
  getRecommendedDishesByCategory,
} from "@/service/statistic";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#E91E63",
  "#9C27B0",
  "#3F51B5",
  "#4CAF50",
  "#FF5722",
  "#795548",
];

const DashboardPage = () => {
  dayjs.extend(isoWeek);

  const [byItem, setByItem] = useState([]);
  const [byGroup, setByGroup] = useState([]);
  const [itemLimit, setItemLimit] = useState(10);
  const [groupLimit, setGroupLimit] = useState(10);
  const [viewType, setViewType] = useState("day");
  const [week, setWeek] = useState(dayjs().isoWeek());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [day, setDay] = useState(dayjs().format("DD")); // day of month (1-31)
  const [monthMode, setMonthMode] = useState("day"); // 'day' hoặc 'week'
  const [year, setYear] = useState(dayjs().year());
  const [pieType, setPieType] = useState("revenue");
  const [pieGroupType, setPieGroupType] = useState("revenue");

  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [recommendedDishesByCategory, setRecommendedDishesByCategory] = useState([]);

  // ===== Helper: Tạo params theo viewType =====
  const buildParams = () => {
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

    return params;
  };

  // ===== Fetch data =====
  const fetchItem = async () => {
    try {
      const params = { ...buildParams(), limit: itemLimit };
      const resItem = await getRevenueByItem(params);
      if (resItem?.success) setByItem(resItem.data || []);
    } catch (err) {
      console.error("❌ Lỗi fetch món ăn:", err);
    }
  };

  const fetchGroup = async () => {
    try {
      const params = { ...buildParams(), limit: groupLimit };
      const resGroup = await getRevenueByDishGroup(params);
      if (resGroup?.success) setByGroup(resGroup.data || []);
    } catch (err) {
      console.error("❌ Lỗi fetch nhóm món:", err);
    }
  };

  const fetchRecommended = async () => {
    try {
      const res = await getRecommendedDishes();
      if (res.success) setRecommendedDishes(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi fetch gợi ý món:", err);
    }
  };

  const fetchRecommendedByCategory = async () => {
    try {
      const res = await getRecommendedDishesByCategory();
      if (res.success) setRecommendedDishesByCategory(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi fetch gợi ý món:", err);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [viewType, week, month, year, itemLimit]);

  useEffect(() => {
    fetchGroup();
  }, [viewType, week, month, year, groupLimit]);

  useEffect(() => {
    fetchRecommended();
    fetchRecommendedByCategory();
  }, []);

  // ===== Tính margin =====
  const byItemWithMargin = byItem.map((item) => {
    const dishName = item.dishName || item._id?.dishName || "Không rõ món";
    const time = item.time || item._id?.time || null;
    const margin = item.totalRevenue > 0 ? (item.totalProfit / item.totalRevenue) * 100 : 0;

    return {
      ...item,
      dishName,
      time,
      margin,
    };
  });

  // Giải phẳng dữ liệu theo nhóm món (byGroup)
  const flattenedGroups = byGroup.flatMap((item) =>
    (item.groups || []).map((g) => ({
      ...g,
      time: item.time,
    }))
  );

  const byGroupWithMargin = flattenedGroups.map((g) => {
    const groupName = g.group || g._id?.group || "Không rõ nhóm";
    const margin = g.totalRevenue > 0 ? (g.totalProfit / g.totalRevenue) * 100 : 0;

    return {
      ...g,
      groupName,
      margin,
    };
  });

  const getPieValue = (obj, type) => {
    switch (type) {
      case "revenue":
        return obj.totalRevenue;
      case "quantity":
        return obj.totalQuantity;
      case "profit":
        return obj.totalProfit;
      case "margin":
        return obj.margin;
      default:
        return 0;
    }
  };

  // Pivot dữ liệu để LineChart hiểu
  const pivotedData = Object.values(
    byGroupWithMargin.reduce((acc, item) => {
      if (!acc[item.time]) acc[item.time] = { time: item.time };
      acc[item.time][item.groupName] = getPieValue(item, pieGroupType);
      return acc;
    }, {})
  );

  // Lấy tất cả groupName để vẽ nhiều Line
  const groupNames = [...new Set(byGroupWithMargin.map((g) => g.groupName))];

  // Gom nhóm món ăn theo danh mục
  const groupedByCategory = recommendedDishesByCategory.reduce((acc, dish) => {
    const categoryName = dish.category?.name || dish.category || "Khác";
    if (!acc[categoryName]) acc[categoryName] = [];
    if (acc[categoryName].length < 5) acc[categoryName].push(dish);
    return acc;
  }, {});

  return (
    <div className='overflow-y-scroll h-full'>
      <Box p={3}>
        <Typography variant='h4' fontWeight='bold' gutterBottom>
          Thống kê món ăn
        </Typography>

        {/* ===== Bộ lọc ===== */}
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
                      <Select value={week} onChange={(e) => setWeek(Number(e.target.value))}>
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
                        <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
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

        {/* ===== Biểu đồ Nhóm (LineChart / BarChart - Recharts) ===== */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 6 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6'>Doanh thu theo Nhóm</Typography>
              <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel>Hiển thị theo</InputLabel>
                <Select value={pieGroupType} onChange={(e) => setPieGroupType(e.target.value)}>
                  <MenuItem value='revenue'>Doanh Thu</MenuItem>
                  <MenuItem value='quantity'>Số Lượng</MenuItem>
                  <MenuItem value='profit'>Lợi nhuận</MenuItem>
                  <MenuItem value='margin'>Tỷ suất (%)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <ResponsiveContainer width='100%' height={400}>
              <LineChart data={pivotedData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='time' /> {/* 👉 Hiển thị ngày ở trục X */}
                <YAxis />
                <Tooltip />
                <Legend />
                {groupNames.map((name, idx) => (
                  <Line
                    key={name}
                    type='monotone'
                    dataKey={name}
                    name={name}
                    strokeWidth={2}
                    stroke={`hsl(${(idx * 50) % 360}, 70%, 50%)`} // màu tự động khác nhau
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ===== Top Món Ăn ===== */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6'>Top Món Ăn Bán Chạy</Typography>
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel>Hiển thị</InputLabel>
                <Select value={itemLimit} onChange={(e) => setItemLimit(Number(e.target.value))}>
                  {[5, 10, 20, 50].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Món ăn</TableCell>
                    <TableCell align='center'>Số lượng</TableCell>
                    <TableCell align='center'>Doanh thu</TableCell>
                    <TableCell align='center'>Lợi nhuận</TableCell>
                    <TableCell align='center'>Tỷ suất (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {byItemWithMargin.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Typography
                          data-tooltip-id='dish-tooltip'
                          data-tooltip-content={item.dishName}
                          sx={{
                            maxWidth: 150,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.dishName}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>{item.totalQuantity}</TableCell>
                      <TableCell align='center'>{item.totalRevenue.toLocaleString("vi-VN")}</TableCell>
                      <TableCell align='center'>{item.totalProfit.toLocaleString("vi-VN")}</TableCell>
                      <TableCell align='center'>{item.margin.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* ===== Biểu đồ Món Ăn (PieChart - Recharts) ===== */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6'>Tỷ lệ Theo Món</Typography>
              <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel>Hiển thị theo</InputLabel>
                <Select value={pieType} onChange={(e) => setPieType(e.target.value)}>
                  <MenuItem value='revenue'>Doanh Thu</MenuItem>
                  <MenuItem value='quantity'>Số Lượng</MenuItem>
                  <MenuItem value='profit'>Lợi nhuận</MenuItem>
                  <MenuItem value='margin'>Tỷ suất (%)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <ResponsiveContainer width='100%' height={350}>
              <PieChart>
                <Pie
                  data={byItemWithMargin}
                  dataKey={(entry) => getPieValue(entry, pieType)}
                  nameKey='dishName'
                  outerRadius={130}
                  label
                >
                  {byItemWithMargin.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ===== Gợi ý món ăn mới ===== */}
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Gợi ý món ăn mới
            </Typography>
            <p>Gợi ý món ăn mới dựa theo chuyên môn của nhà hàng</p>

            {recommendedDishes.length > 0 ? (
              <Grid container spacing={2}>
                {recommendedDishes.map((dish, index) => (
                  <Grid item xs={12} key={index}>
                    <Card
                      sx={{
                        width: "100%",
                        borderRadius: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: 2,
                        backgroundColor: "#fafafa",
                        transition: "0.3s",
                        "&:hover": { boxShadow: 6, transform: "translateY(-5px)" },
                      }}
                    >
                      <CardContent>
                        <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
                          {dish.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                          {dish.description}
                        </Typography>
                        <Typography variant='subtitle2' fontWeight='bold' color='text.primary'>
                          Nguyên liệu chính:
                        </Typography>
                        <Typography variant='body2'>{dish.mainIngredients.join(", ")}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>Đang phân tích dữ liệu & gợi ý món ăn...</Typography>
            )}
          </CardContent>
        </Card>

        {/* ===== Gợi ý món ăn theo danh mục ===== */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Gợi ý món ăn theo danh mục
            </Typography>

            {recommendedDishesByCategory.length > 0 ? (
              Object.entries(groupedByCategory).map(([category, dishes]) => (
                <Box key={category} mb={2}>
                  <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
                    Các món {category}:
                  </Typography>

                  <Typography variant='body2' color='text.secondary'>
                    {dishes.map((d) => d.name).join(", ")}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>Đang phân tích dữ liệu & gợi ý món ăn theo danh mục...</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default DashboardPage;
