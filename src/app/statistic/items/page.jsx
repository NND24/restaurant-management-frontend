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
} from "@mui/material";
import { PieChart, Pie, Tooltip as RechartsTooltip, Cell, Legend, ResponsiveContainer } from "recharts";
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
  const [year, setYear] = useState(dayjs().year());
  const [pieType, setPieType] = useState("revenue");
  const [pieGroupType, setPieGroupType] = useState("revenue");

  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [recommendedDishesByCategory, setRecommendedDishesByCategory] = useState([]);

  // ===== Fetch data =====
  const fetchItem = async () => {
    const resItem = await getRevenueByItem({ limit: itemLimit, period: viewType, month, year });
    setByItem(resItem.data);
  };

  const fetchGroup = async () => {
    const resGroup = await getRevenueByDishGroup({ limit: groupLimit, period: viewType, month, year });
    setByGroup(resGroup.data);
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
  const byItemWithMargin = byItem.map((item) => ({
    ...item,
    margin: item.totalRevenue > 0 ? (item.totalProfit / item.totalRevenue) * 100 : 0,
  }));

  const byGroupWithMargin = byGroup.map((g) => ({
    ...g,
    margin: g.totalRevenue > 0 ? (g.totalProfit / g.totalRevenue) * 100 : 0,
  }));

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
        <Card sx={{ borderRadius: 3, mb: 4, boxShadow: 3, backgroundColor: "#fff" }}>
          <CardContent>
            <Box display='flex' gap={3} flexWrap='wrap' alignItems='center'>
              <FormControl size='medium' sx={{ minWidth: 160 }}>
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

        {/* ===== Top Nhóm Món Ăn ===== */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6'>🥗 Top Nhóm Món Ăn</Typography>
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel>Hiển thị</InputLabel>
                <Select value={groupLimit} onChange={(e) => setGroupLimit(Number(e.target.value))}>
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
                    <TableCell>Nhóm</TableCell>
                    <TableCell align='center'>Số lượng</TableCell>
                    <TableCell align='center'>Doanh thu</TableCell>
                    <TableCell align='center'>Lợi nhuận</TableCell>
                    <TableCell align='center'>Tỷ suất (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {byGroupWithMargin.map((g, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Typography
                          data-tooltip-id='dish-tooltip'
                          data-tooltip-content={g.groupName}
                          sx={{
                            minWidth: 85,
                            maxWidth: 150,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {g.groupName}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>{g.totalQuantity}</TableCell>
                      <TableCell align='center'>{g.totalRevenue.toLocaleString("vi-VN")}</TableCell>
                      <TableCell align='center'>{g.totalProfit.toLocaleString("vi-VN")}</TableCell>
                      <TableCell align='center'>{g.margin.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* ===== Biểu đồ Nhóm (PieChart - Recharts) ===== */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 6 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6'>📊 Tỷ lệ Theo Nhóm</Typography>
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

            <ResponsiveContainer width='100%' height={350}>
              <PieChart>
                <Pie
                  data={byGroupWithMargin}
                  dataKey={(entry) => getPieValue(entry, pieGroupType)}
                  nameKey='groupName'
                  outerRadius={130}
                  label
                >
                  {byGroupWithMargin.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ===== Top Món Ăn ===== */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6'>🍽️ Top Món Ăn Bán Chạy</Typography>
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
              <Typography variant='h6'>📊 Tỷ lệ Theo Món</Typography>
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
              🍽️ Gợi ý món ăn mới
            </Typography>

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
              🍱 Gợi ý món ăn theo danh mục
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
