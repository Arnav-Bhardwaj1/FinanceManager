import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Fade,
  Slide,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Receipt,
  Assessment,
  Refresh,
  PieChart as PieChartIcon,
  Timeline,
  Insights,
  Lightbulb,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { 
  formatCurrency, 
  getPastMonths, 
  CategoryDistributionChart, 
  ExpenseTrendChart,
  COLORS 
} from '../components/analytics/ChartComponents';

const Analytics = () => {
  const { 
    stats, 
    expenses: recentExpenses, 
    loading, 
    error,
    refreshData 
  } = useExpense();
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        await refreshData({ startDate, endDate });
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    };
    loadData();
  }, [selectedMonth, refreshData]);

  const getCategoryStats = (distribution) => {
    if (!distribution || !stats?.summary?.total) return [];
    
    return distribution.map(cat => ({
      category: cat.name,
      amount: cat.value,
      percentage: (cat.value / stats.summary.total * 100).toFixed(1),
      transactions: recentExpenses ? recentExpenses.filter(expense => expense.category === cat.name).length : 0
    }));
  };

  const getInsights = () => {
    if (!stats || !recentExpenses) return [];
    
    const insights = [];
    
    // Spending trend insight
    if (stats.trend && stats.trend.length > 0) {
      const avgSpending = stats.summary.average;
      const recentAvg = stats.trend.slice(-3).reduce((sum, day) => sum + day.amount, 0) / 3;
      
      if (recentAvg > avgSpending * 1.2) {
        insights.push({
          type: 'warning',
          icon: Warning,
          title: 'Spending Increase Detected',
          message: `Your recent spending is ${Math.round(((recentAvg - avgSpending) / avgSpending) * 100)}% higher than your monthly average.`,
          color: 'warning'
        });
      } else if (recentAvg < avgSpending * 0.8) {
        insights.push({
          type: 'success',
          icon: CheckCircle,
          title: 'Great Spending Control',
          message: `You're spending ${Math.round(((avgSpending - recentAvg) / avgSpending) * 100)}% less than your monthly average. Keep it up!`,
          color: 'success'
        });
      }
    }
    
    // Category insight
    if (stats.distribution && stats.distribution.length > 0) {
      const topCategory = stats.distribution.reduce((a, b) => (b.value > a.value ? b : a));
      const topPercentage = (topCategory.value / stats.summary.total * 100).toFixed(1);
      
      insights.push({
        type: 'info',
        icon: Insights,
        title: 'Top Spending Category',
        message: `${topCategory.name} accounts for ${topPercentage}% of your total expenses this month.`,
        color: 'info'
      });
    }
    
    // Savings opportunity
    if (stats.summary && stats.summary.total > 0) {
      const potentialSavings = stats.summary.total * 0.1; // 10% savings opportunity
      insights.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Savings Opportunity',
        message: `Consider reducing discretionary spending by 10% to save ${formatCurrency(potentialSavings)} this month.`,
        color: 'primary'
      });
    }
    
    return insights;
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{
          background: theme => theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: 'primary.main',
              mb: 2,
            }} 
          />
          <Typography variant="h6" color="text.secondary">
            Loading Analytics...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(244, 67, 54, 0.1)'
              : 'rgba(244, 67, 54, 0.05)',
            border: '1px solid',
            borderColor: 'error.main',
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={refreshData}
          startIcon={<Refresh />}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(45deg, #2196f3, #1976d2)',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2, #1565c0)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
            },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderOverviewTab = () => (
    <Box>
      {/* Quick Stats */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <Slide direction="up" in={true} timeout={600}>
            <Card
              sx={{
                height: '100%',
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 30, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
                  borderRadius: '12px 12px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
                      mr: 1.5,
                      width: 36,
                      height: 36,
                    }}
                  >
                    <AccountBalanceWallet sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Total Expenses
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 1,
                    fontSize: '1.8rem',
                  }}
                >
                  {formatCurrency(stats?.summary?.total || 0)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Chip
                    label="This Month"
                    size="small"
                    sx={{
                      background: 'rgba(33, 150, 243, 0.1)',
                      color: 'primary.main',
                      fontSize: '0.8rem',
                      height: 22,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Slide direction="up" in={true} timeout={800}>
            <Card
              sx={{
                height: '100%',
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 30, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #4caf50, #81c784)',
                  borderRadius: '12px 12px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(45deg, #4caf50, #81c784)',
                      mr: 1.5,
                      width: 36,
                      height: 36,
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Daily Average
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'success.main',
                    mb: 1,
                    fontSize: '1.8rem',
                  }}
                >
                  {formatCurrency(stats?.summary?.average || 0)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Chip
                    label="Per Day"
                    size="small"
                    sx={{
                      background: 'rgba(76, 175, 80, 0.1)',
                      color: 'success.main',
                      fontSize: '0.8rem',
                      height: 22,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Slide direction="up" in={true} timeout={1000}>
            <Card
              sx={{
                height: '100%',
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 30, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #f50057, #ff4081)',
                  borderRadius: '12px 12px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(45deg, #f50057, #ff4081)',
                      mr: 1.5,
                      width: 36,
                      height: 36,
                    }}
                  >
                    <Receipt sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Transactions
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'secondary.main',
                    mb: 1,
                    fontSize: '1.8rem',
                  }}
                >
                  {stats?.summary?.count || 0}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Chip
                    label="This Month"
                    size="small"
                    sx={{
                      background: 'rgba(245, 0, 87, 0.1)',
                      color: 'secondary.main',
                      fontSize: '0.8rem',
                      height: 22,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        {/* 7-Day Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Slide direction="up" in={true} timeout={1200}>
            <Card
              sx={{
                height: '400px',
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 30, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
                  borderRadius: '12px 12px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
                      mr: 2,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <Assessment sx={{ fontSize: 22 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Expense Trend (Last 7 Days)
                  </Typography>
                </Box>
                {stats?.trend && stats.trend.length > 0 ? (
                  <ExpenseTrendChart 
                    data={stats.trend.slice(-7)}
                    title="Expense Trend (Last 7 Days)"
                    height={300}
                  />
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Assessment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography color="text.secondary" variant="h6">
                        No expense data available
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Add some expenses to see your spending trends
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Slide direction="up" in={true} timeout={1400}>
            <Card
              sx={{
                height: '450px',
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 30, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #4caf50, #81c784)',
                  borderRadius: '12px 12px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(45deg, #4caf50, #81c784)',
                      mr: 2,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <PieChartIcon sx={{ fontSize: 22 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Categories
                  </Typography>
                </Box>
                <CategoryDistributionChart 
                  distribution={stats?.distribution}
                  showPercentages={true}
                  showLegend={true}
                />
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* Recent Expenses */}
      <Grid item xs={12}>
        <Slide direction="up" in={true} timeout={1600}>
          <Card
            sx={{
              background: theme => theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #f50057, #ff4081)',
                borderRadius: '12px 12px 0 0',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(45deg, #f50057, #ff4081)',
                    mr: 2,
                    width: 40,
                    height: 40,
                  }}
                >
                  <Receipt sx={{ fontSize: 22 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  Recent Expenses
                </Typography>
              </Box>

              <Box>
                {recentExpenses && recentExpenses.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recentExpenses.slice(0, 5).map((expense, index) => (
                      <Fade in={true} timeout={1800 + index * 200} key={expense._id}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            background: theme => theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.03)'
                              : 'rgba(0, 0, 0, 0.02)',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: theme => theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.08)'
                                : 'rgba(0, 0, 0, 0.05)',
                              transform: 'translateX(8px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                              }}
                            >
                              {expense.category?.charAt(0)?.toUpperCase() || 'E'}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  color: 'text.primary',
                                  mb: 0.5,
                                }}
                              >
                                {expense.description}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {new Date(expense.date).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </Typography>
                                <Box
                                  sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    backgroundColor: 'text.secondary',
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  {expense.category}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: 'error.main',
                                fontSize: '1.1rem',
                              }}
                            >
                              -{formatCurrency(expense.amount)}
                            </Typography>
                          </Box>
                        </Box>
                      </Fade>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}>
                    <Box>
                      <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                        No recent expenses
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Add some expenses to see them here
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Slide>
      </Grid>
    </Box>
  );

  const renderReportsTab = () => (
    <Box>
      {/* Category Breakdown Table */}
      <Grid item xs={12} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Slide direction="up" in={true} timeout={600}>
          <Card
            sx={{
              background: theme => theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ff9800, #ffb74d)',
                borderRadius: '12px 12px 0 0',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                    mr: 2,
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                  }}
                >
                  <Assessment sx={{ fontSize: { xs: 18, sm: 22 } }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Category Breakdown
                </Typography>
              </Box>
              <TableContainer sx={{ 
                maxHeight: { xs: 400, sm: 'none' },
                overflowX: { xs: 'auto', sm: 'visible' },
              }}>
                <Table sx={{ minWidth: { xs: 600, sm: 'auto' } }}>
                  <TableHead>
                    <TableRow sx={{ 
                      background: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.02)',
                    }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Category</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Amount</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' }, display: { xs: 'none', sm: 'table-cell' } }}>% of Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' }, display: { xs: 'none', md: 'table-cell' } }}># of Transactions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCategoryStats(stats?.distribution).map((cat, index) => (
                      <Fade in={true} timeout={800 + index * 100} key={cat.category}>
                        <TableRow 
                          sx={{ 
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: theme => theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(0, 0, 0, 0.02)',
                              transform: 'scale(1.01)',
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                              <Avatar
                                sx={{
                                  width: { xs: 28, sm: 32 },
                                  height: { xs: 28, sm: 32 },
                                  background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                  fontWeight: 600,
                                }}
                              >
                                {cat.category?.charAt(0)?.toUpperCase() || 'C'}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                  {cat.category}
                                </Typography>
                                <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, mt: 0.5 }}>
                                  <Chip
                                    label={`${cat.percentage}%`}
                                    size="small"
                                    sx={{
                                      background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                                      color: 'white',
                                      fontWeight: 500,
                                      fontSize: '0.7rem',
                                      height: 20,
                                    }}
                                  />
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ fontSize: '0.7rem' }}
                                  >
                                    {cat.transactions} transactions
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 600,
                                color: 'error.main',
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                              }}
                            >
                              {formatCurrency(cat.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            <Chip
                              label={`${cat.percentage}%`}
                              size="small"
                              sx={{
                                background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            <Typography variant="body2" color="text.secondary">
                              {cat.transactions}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Slide>
      </Grid>

      {/* Monthly Insights */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Grid item xs={12} md={6}>
          <Slide direction="up" in={true} timeout={1000}>
            <Card
              sx={{
                height: '100%',
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 30, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #9c27b0, #ba68c8)',
                  borderRadius: '12px 12px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                      mr: 2,
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                    }}
                  >
                    <Timeline sx={{ fontSize: { xs: 18, sm: 22 } }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                    Monthly Insights
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    background: theme => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Highest Daily Expense:
                    </Typography>
                    <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }}>
                      {stats?.trend && stats.trend.length > 0 ? 
                        formatCurrency(Math.max(...stats.trend.map(t => t.amount))) : 
                        'No data'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    background: theme => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Days with Expenses:
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      {stats?.trend?.filter(t => t.amount > 0).length || 0} out of {stats?.trend?.length || 0} days
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    background: theme => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Most Active Category:
                    </Typography>
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                      {stats?.distribution && stats.distribution.length > 0
                        ? stats.distribution.reduce((a, b) => (b.value > a.value ? b : a)).name
                        : 'No data'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    background: theme => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Average Transaction Size:
                    </Typography>
                    <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 700 }}>
                      {stats?.summary
                        ? formatCurrency(stats.summary.total / stats.summary.count)
                        : 'No data'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Category Distribution Chart */}
        <Grid item xs={12} sm={6} md={6}>
          <Slide direction="up" in={true} timeout={1200}>
            <Card
              sx={{
                height: '100%',
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 30, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #4caf50, #81c784)',
                  borderRadius: '12px 12px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(45deg, #4caf50, #81c784)',
                      mr: 2,
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                    }}
                  >
                    <PieChartIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                    Category Distribution
                  </Typography>
                </Box>
                <CategoryDistributionChart 
                  distribution={stats?.distribution}
                  showPercentages={true}
                  showLegend={true}
                  height={500}
                  innerRadius={80}
                  outerRadius={120}
                />
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* Daily Expense Trend Chart */}
      <Grid item xs={12} sx={{ mb: { xs: 2, sm: 0 } }}>
        <Slide direction="up" in={true} timeout={1400}>
          <Card
            sx={{
              background: theme => theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
                borderRadius: '12px 12px 0 0',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
                    mr: 2,
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                  }}
                >
                  <Timeline sx={{ fontSize: { xs: 18, sm: 22 } }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Daily Expense Trend
                </Typography>
              </Box>
              <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
                <ExpenseTrendChart 
                  data={stats?.trend}
                  title="Daily Expense Trend"
                  height={400}
                />
              </Box>
            </CardContent>
          </Card>
        </Slide>
      </Grid>
    </Box>
  );

  const renderInsightsTab = () => {
    const insights = getInsights();
    
    return (
      <Box>
        <Grid container spacing={3}>
          {/* Insights Cards */}
          {insights.map((insight, index) => {
            const InsightIcon = insight.icon;
            return (
              <Grid item xs={12} md={6} key={index}>
                <Slide direction="up" in={true} timeout={600 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      background: theme => theme.palette.mode === 'dark'
                        ? 'rgba(30, 30, 30, 0.8)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                        borderRadius: '12px 12px 0 0',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                            mr: 2,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <InsightIcon sx={{ fontSize: 22 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {insight.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary">
                        {insight.message}
                      </Typography>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            );
          })}

          {/* Spending Patterns */}
          <Grid item xs={12}>
            <Slide direction="up" in={true} timeout={1200}>
              <Card
                sx={{
                  background: theme => theme.palette.mode === 'dark'
                    ? 'rgba(30, 30, 30, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #9c27b0, #ba68c8)',
                    borderRadius: '12px 12px 0 0',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                        mr: 2,
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Insights sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      Spending Patterns & Recommendations
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Weekly Spending Pattern
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <ExpenseTrendChart 
                          data={stats?.trend?.slice(-7)}
                          title="Weekly Spending Pattern"
                          height={300}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Recommendations
                      </Typography>
                      <List>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ background: 'linear-gradient(45deg, #4caf50, #66bb6a)', width: 32, height: 32 }}>
                              <Lightbulb sx={{ fontSize: 18 }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Track Daily Spending"
                            secondary="Monitor your daily expenses to identify spending patterns and opportunities for savings."
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ background: 'linear-gradient(45deg, #2196f3, #64b5f6)', width: 32, height: 32 }}>
                              <Assessment sx={{ fontSize: 18 }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Set Monthly Budgets"
                            secondary="Create category-specific budgets to better control your spending habits."
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ background: 'linear-gradient(45deg, #ff9800, #ffb74d)', width: 32, height: 32 }}>
                              <TrendingUp sx={{ fontSize: 18 }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Review Weekly Reports"
                            secondary="Check your spending trends weekly to make timely adjustments to your budget."
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      {/* Header Section */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: { xs: 1.5, sm: 3, md: 4 } }}>
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 700,
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #2196f3, #64b5f6)'
                : 'linear-gradient(45deg, #1976d2, #2196f3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem', lg: '2.5rem' },
            }}
          >
            Financial Analytics
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 },
          }}>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                mb: { xs: 1, sm: 0 },
              }}
            >
              Comprehensive insights into your financial patterns and spending habits
            </Typography>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Select Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Select Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                {getPastMonths().map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Fade>

      {/* Tabs */}
      <Box sx={{ mb: { xs: 1.5, sm: 3, md: 4 } }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={window.innerWidth < 600 ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
              textTransform: 'none',
              minHeight: { xs: 40, sm: 44, md: 52 },
              borderRadius: 2,
              mx: { xs: 0.25, sm: 0.5, md: 1 },
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              background: theme => theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(100, 181, 246, 0.1))',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover': {
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                border: '2px solid rgba(33, 150, 243, 0.3)',
                '&::before': {
                  opacity: 1,
                },
              },
              '&.Mui-selected': {
                color: 'primary.main',
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(33, 150, 243, 0.15)'
                  : 'rgba(33, 150, 243, 0.08)',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                border: '2px solid rgba(33, 150, 243, 0.5)',
                '&::before': {
                  opacity: 1,
                },
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
            },
            '& .MuiTabs-flexContainer': {
              gap: 1,
            },
          }}
        >
          <Tab 
            label="Overview" 
            icon={<Assessment />} 
            iconPosition="start"
            sx={{
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.25, md: 1.5 },
              '& .MuiSvgIcon-root': {
                transition: 'all 0.3s ease',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              },
              '&:hover .MuiSvgIcon-root': {
                transform: 'scale(1.15) rotate(5deg)',
                color: 'primary.main',
                filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.4))',
              },
              '&.Mui-selected .MuiSvgIcon-root': {
                color: 'primary.main',
                filter: 'drop-shadow(0 3px 6px rgba(33, 150, 243, 0.4))',
                transform: 'scale(1.1)',
              },
            }}
          />
          <Tab 
            label="Reports" 
            icon={<Timeline />} 
            iconPosition="start"
            sx={{
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.25, md: 1.5 },
              '& .MuiSvgIcon-root': {
                transition: 'all 0.3s ease',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              },
              '&:hover .MuiSvgIcon-root': {
                transform: 'scale(1.15) rotate(-5deg)',
                color: 'primary.main',
                filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.4))',
              },
              '&.Mui-selected .MuiSvgIcon-root': {
                color: 'primary.main',
                filter: 'drop-shadow(0 3px 6px rgba(33, 150, 243, 0.4))',
                transform: 'scale(1.1)',
              },
            }}
          />
          <Tab 
            label="Insights" 
            icon={<Insights />} 
            iconPosition="start"
            sx={{
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.25, md: 1.5 },
              '& .MuiSvgIcon-root': {
                transition: 'all 0.3s ease',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              },
              '&:hover .MuiSvgIcon-root': {
                transform: 'scale(1.15) rotate(3deg)',
                color: 'primary.main',
                filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.4))',
              },
              '&.Mui-selected .MuiSvgIcon-root': {
                color: 'primary.main',
                filter: 'drop-shadow(0 3px 6px rgba(33, 150, 243, 0.4))',
                transform: 'scale(1.1)',
              },
            }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && renderOverviewTab()}
        {activeTab === 1 && renderReportsTab()}
        {activeTab === 2 && renderInsightsTab()}
      </Box>
    </Box>
  );
};

export default Analytics;
