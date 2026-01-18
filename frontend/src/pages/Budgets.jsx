import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Slide,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  AlertTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalanceWallet,
  AttachMoney,
  Category,
  CalendarToday,
  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Notifications,
  NotificationsOff,
} from '@mui/icons-material';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/formatCurrency';

const categories = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Other',
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const BudgetForm = ({ budget, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: '',
    description: '',
    notifications: {
      enabled: true,
      threshold: 80,
    },
    ...budget,
  });

  useEffect(() => {
    if (!formData.month) {
      const now = new Date();
      setFormData(prev => ({
        ...prev,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'threshold' || name === 'enabled') {
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: name === 'enabled' ? value === 'true' : Number(value),
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            select
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Select category"
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'text.primary',
                fontWeight: 500,
                '&.Mui-focused': {
                  color: 'primary.main',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Category sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            type="number"
            name="amount"
            label="Budget Amount (₹)"
            value={formData.amount}
            onChange={handleChange}
            inputProps={{ min: 0, step: 0.01 }}
            placeholder="Enter budget amount"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            type="month"
            name="month"
            label="Month"
            value={formData.month}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            name="description"
            label="Description (Optional)"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Add description (optional)"
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Notification Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Enable Alerts</InputLabel>
                  <Select
                    name="enabled"
                    value={formData.notifications?.enabled ? 'true' : 'false'}
                    onChange={handleChange}
                    label="Enable Alerts"
                  >
                    <MenuItem value="true">Enabled</MenuItem>
                    <MenuItem value="false">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  name="threshold"
                  label="Alert Threshold (%)"
                  value={formData.notifications?.threshold || 80}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 100 }}
                  helperText="Alert when budget usage reaches this percentage"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {budget ? 'Update' : 'Create'} Budget
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

const Budgets = () => {
  const {
    budgets,
    statistics,
    alerts,
    loading,
    error,
    fetchBudgets,
    fetchStatistics,
    fetchAlerts,
    addOrUpdateBudget,
    removeBudget,
    refreshData,
  } = useBudget();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      await refreshData(selectedMonth);
    } catch (err) {
      console.error('Error loading budget data:', err);
    }
  };

  const handleOpenDialog = (budget = null) => {
    setSelectedBudget(budget);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedBudget(null);
    setOpenDialog(false);
  };

  const handleSubmit = async (formData) => {
    try {
      await addOrUpdateBudget(formData);
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving budget:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await removeBudget(id, selectedMonth);
      } catch (err) {
        console.error('Error deleting budget:', err);
      }
    }
  };

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
      
      months.push({ value: monthValue, label: monthLabel });
    }
    return months;
  };

  if (loading && budgets.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 3 }}>
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
              mb: 2,
            }}
          >
            Budget Management
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Set and track monthly budgets for each category
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Budget
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <Slide direction="down" in={true} timeout={600}>
          <Box sx={{ mb: 3 }}>
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.isExceeded ? 'error' : 'warning'}
                icon={alert.isExceeded ? <Warning /> : <Notifications />}
                sx={{ mb: 1 }}
              >
                <AlertTitle>{alert.category} Budget Alert</AlertTitle>
                {alert.message} (Spent: {formatCurrency(alert.spentAmount)} / Budget: {formatCurrency(alert.budgetAmount)})
              </Alert>
            ))}
          </Box>
        </Slide>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Overview */}
      {statistics && (
        <Fade in={true} timeout={1000}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: theme => theme.palette.mode === 'dark'
                    ? 'rgba(30, 30, 30, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ background: 'linear-gradient(45deg, #2196f3, #64b5f6)' }}>
                      <AccountBalanceWallet />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {formatCurrency(statistics.totalBudget)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Budget
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: theme => theme.palette.mode === 'dark'
                    ? 'rgba(30, 30, 30, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ background: 'linear-gradient(45deg, #f50057, #ff4081)' }}>
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {formatCurrency(statistics.totalSpent)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Spent
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: theme => theme.palette.mode === 'dark'
                    ? 'rgba(30, 30, 30, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ background: 'linear-gradient(45deg, #4caf50, #81c784)' }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatCurrency(statistics.totalRemaining)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Remaining
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: theme => theme.palette.mode === 'dark'
                    ? 'rgba(30, 30, 30, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ background: 'linear-gradient(45deg, #ff9800, #ffb74d)' }}>
                      <TrendingDown />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {Math.round(statistics.overallUsage)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overall Usage
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Budget Cards */}
      {budgets.length > 0 ? (
        <Grid container spacing={3}>
          {budgets.map((budget, index) => {
            const usagePercentage = budget.usagePercentage || 0;
            const isExceeded = budget.isExceeded || false;
            const isWarning = usagePercentage >= (budget.notifications?.threshold || 80) && !isExceeded;

            return (
              <Grid item xs={12} sm={6} md={4} key={budget._id}>
                <Slide direction="up" in={true} timeout={600 + index * 100}>
                  <Card
                    sx={{
                      background: theme => theme.palette.mode === 'dark'
                        ? 'rgba(30, 30, 30, 0.8)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid',
                      borderColor: isExceeded ? 'error.main' : isWarning ? 'warning.main' : 'divider',
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
                        background: isExceeded
                          ? 'linear-gradient(90deg, #f50057, #ff4081)'
                          : isWarning
                          ? 'linear-gradient(90deg, #ff9800, #ffb74d)'
                          : `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                        borderRadius: '12px 12px 0 0',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                            }}
                          >
                            {budget.category.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {budget.category}
                            </Typography>
                            <Chip
                              label={isExceeded ? 'Exceeded' : isWarning ? 'Warning' : 'On Track'}
                              size="small"
                              color={isExceeded ? 'error' : isWarning ? 'warning' : 'success'}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(budget)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(budget._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Budget: {formatCurrency(budget.amount)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(usagePercentage)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(usagePercentage, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              background: isExceeded
                                ? 'linear-gradient(90deg, #f50057, #ff4081)'
                                : isWarning
                                ? 'linear-gradient(90deg, #ff9800, #ffb74d)'
                                : `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                            Spent: {formatCurrency(budget.spentAmount || 0)}
                          </Typography>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                            Remaining: {formatCurrency(budget.remaining || budget.amount)}
                          </Typography>
                        </Box>
                      </Box>

                      {budget.notifications?.enabled && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Notifications fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Alerts enabled at {budget.notifications.threshold}%
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Fade in={true} timeout={1200}>
          <Card
            sx={{
              textAlign: 'center',
              py: 6,
              background: theme => theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <AccountBalanceWallet sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              No Budgets Set
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start managing your finances by creating your first budget
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create Budget
            </Button>
          </Card>
        </Fade>
      )}

      {/* Budget Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(4px)',
            backgroundColor: theme => theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.6)'
              : 'rgba(0, 0, 0, 0.4)',
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.7), rgba(40, 40, 40, 0.6))'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(250, 250, 250, 0.6))',
            backdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid',
            borderColor: theme => theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.18)'
              : 'rgba(0, 0, 0, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'inherit',
              padding: '1px',
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
            },
          },
        }}
      >
        <DialogTitle>
          {selectedBudget ? 'Edit Budget' : 'Create New Budget'}
        </DialogTitle>
        <DialogContent>
          <BudgetForm
            budget={selectedBudget}
            onSubmit={handleSubmit}
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Budgets;
