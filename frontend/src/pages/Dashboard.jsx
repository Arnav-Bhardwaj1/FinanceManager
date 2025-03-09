import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, CartesianGrid, Cell } from 'recharts';
import { useExpense } from '../context/ExpenseContext';
import RefreshIcon from '@mui/icons-material/Refresh';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

const Dashboard = () => {
  const { 
    stats, 
    expenses: recentExpenses, 
    loading, 
    error,
    refreshData 
  } = useExpense();
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
        await refreshData({ startDate, endDate });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadData();
  }, [selectedMonth, refreshData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={refreshData}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
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
        {/* Summary Cards */}
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
              Total Transactions
            </Typography>
            <Typography variant="h4">
              {stats?.summary?.count || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Expense Trend (Last 7 Days)
            </Typography>
            {stats?.trend && stats.trend.length > 0 ? (
              <LineChart
                data={stats.trend}
                width={600}
                height={300}
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
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No expense data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            {stats?.distribution && stats.distribution.length > 0 ? (
              <Box sx={{ 
                width: '100%', 
                height: '320px',
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                mt: 1
              }}>
                <PieChart width={300} height={200}>
                  <Pie
                    data={stats.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={false}
                  >
                    {stats.distribution.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '8px'
                    }}
                  />
                </PieChart>
                <Box sx={{ 
                  width: '100%', 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  mt: 2,
                  px: 2,
                  overflow: 'auto'
                }}>
                  {stats.distribution.map((entry, index) => (
                    <Box 
                      key={entry.name}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: '28px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: COLORS[index % COLORS.length],
                            flexShrink: 0
                          }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {entry.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500,
                        color: 'text.primary',
                        ml: 2
                      }}>
                        {formatCurrency(entry.value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No category data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Expenses */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Expenses
            </Typography>
            <Box>
              {recentExpenses && recentExpenses.length > 0 ? (
                recentExpenses.slice(0, 5).map((expense) => (
                  <Box
                    key={expense._id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #eee',
                      py: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {expense.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(expense.date).toLocaleDateString()} - {expense.category}
                      </Typography>
                    </Box>
                    <Typography variant="h6">{formatCurrency(expense.amount)}</Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary" align="center">No recent expenses</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
