import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getExpenseStatistics } from '../services/expenseService';
import { useExpense } from '../context/ExpenseContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF99E6', '#4D4DFF'];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

const CategoryDistributionChart = ({ distribution, showPercentages, showLegend }) => {
  if (!distribution || distribution.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No category data available</Typography>
      </Box>
    );
  }

  // Transform the data for the pie chart
  const pieData = distribution.map(item => ({
    name: item.name,
    value: item.value
  }));

  return (
    <Box sx={{ height: 400, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              name,
              percent
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = outerRadius * 1.2;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="#888"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontSize="12px"
                >
                  {`${name} (${(percent * 100).toFixed(0)}%)`}
                </text>
              );
            }}
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 8,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '8px 12px',
            }}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

const Reports = () => {
  const { loading, error, stats, fetchStats } = useExpense();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const getPastMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleString('default', { 
        month: 'long',
        year: 'numeric'
      });
      
      months.push({
        value: monthValue,
        label: monthLabel
      });
    }
    return months;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        await fetchStats({ startDate, endDate });
      } catch (err) {
        console.error('Error loading report data:', err);
      }
    };
    loadData();
  }, [selectedMonth, fetchStats]);

  // Add function to calculate category-wise statistics
  const getCategoryStats = (distribution) => {
    if (!distribution || !stats?.summary?.total) return [];
    
    return distribution.map(cat => ({
      category: cat.name,
      amount: cat.value,
      percentage: (cat.value / stats.summary.total * 100).toFixed(1),
      transactions: stats.trend.filter(t => t.category === cat.name).length
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Expense Reports</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            label="Select Month"
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {getPastMonths().map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Statistics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4">
              {formatCurrency(stats?.summary?.total || 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Average
            </Typography>
            <Typography variant="h4">
              {formatCurrency(stats?.summary?.average || 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Number of Expenses
            </Typography>
            <Typography variant="h4">
              {stats?.summary?.count || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* New: Monthly Overview Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Category Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">% of Total</TableCell>
                    <TableCell align="right"># of Transactions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCategoryStats(stats?.distribution).map((cat) => (
                    <TableRow key={cat.category}>
                      <TableCell>{cat.category}</TableCell>
                      <TableCell align="right">{formatCurrency(cat.amount)}</TableCell>
                      <TableCell align="right">{cat.percentage}%</TableCell>
                      <TableCell align="right">{cat.transactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* New: Key Insights */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Insights
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Highest Daily Expense:
                {stats?.trend && stats.trend.length > 0 ? (
                  ` ${formatCurrency(Math.max(...stats.trend.map(t => t.amount)))}`
                ) : ' No data'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Days with Expenses:
                {` ${stats?.trend?.filter(t => t.amount > 0).length || 0} out of ${stats?.trend?.length || 0} days`}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Most Active Category:
                {stats?.distribution && stats.distribution.length > 0
                  ? ` ${stats.distribution.reduce((a, b) => (b.value > a.value ? b : a)).name}`
                  : ' No data'}
              </Typography>
              <Typography variant="subtitle1">
                Average Transaction Size:
                {stats?.summary
                  ? ` ${formatCurrency(stats.summary.total / stats.summary.count)}`
                  : ' No data'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Modified: Category Distribution with more detail */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <CategoryDistributionChart 
              distribution={stats?.distribution}
              showPercentages={true}
              showLegend={true}
            />
          </Paper>
        </Grid>

        {/* Modified: Daily Expenses Chart - keep this but move it down */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Expense Trend
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              {stats?.trend && stats.trend.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart
                    data={stats.trend}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => {
                        const formattedDate = new Date(date);
                        return formattedDate.toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short'
                        });
                      }}
                    />
                    <YAxis
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      labelFormatter={(date) => {
                        const formattedDate = new Date(date);
                        return formattedDate.toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      }}
                      formatter={(value) => [`₹${value}`, 'Amount']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="Daily Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No expense data available for this period</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
