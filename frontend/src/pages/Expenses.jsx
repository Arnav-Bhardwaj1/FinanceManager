import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Fade,
  Slide,
  Avatar,
  Chip,
  InputAdornment,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Receipt,
  AttachMoney,
  Category,
  CalendarToday,
  Description,
} from '@mui/icons-material';
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from '../services/expenseService';
import { useExpense } from '../context/ExpenseContext';
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

const ExpenseForm = ({ expense, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    ...expense,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                '&.Mui-focused': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            type="number"
            name="amount"
            label="Amount"
            value={formData.amount}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                '&.Mui-focused': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            select
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Category sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                '&.Mui-focused': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                },
              },
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
            type="date"
            name="date"
            label="Date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                '&.Mui-focused': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            name="notes"
            label="Notes"
            value={formData.notes}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Receipt sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                '&.Mui-focused': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button 
              onClick={onClose}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                },
              }}
            >
              {expense ? 'Update' : 'Add'} Expense
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

const Expenses = () => {
  const { expenses, loading, error, fetchExpenses, refreshData } = useExpense();
  const [open, setOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
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
    const fetchExpensesForMonth = async () => {
      try {
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        await fetchExpenses({ startDate, endDate });
      } catch (err) {
        console.error('Error fetching expenses:', err);
      }
    };

    fetchExpensesForMonth();
  }, [selectedMonth, fetchExpenses]);

  const handleOpen = (expense = null) => {
    setSelectedExpense(expense);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedExpense(null);
    setOpen(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense._id, formData);
      } else {
        await createExpense(formData);
      }
      await refreshData();
      handleClose();
    } catch (err) {
      console.error('Error saving expense:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      await fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
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
            Loading Expenses...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: { xs: 1, sm: 1.5, md: 2 } }}>
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
              mb: { xs: 1, sm: 1.5 },
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem', lg: '2.5rem' },
            }}
          >
            Expense Management
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1.5, sm: 0 },
          }}>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                mb: { xs: 0.5, sm: 0 },
                lineHeight: 1.4,
              }}
            >
              Track and manage your daily expenses
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
            }}>
              <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                <InputLabel sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Select Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Select Month"
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  {getPastMonths().map((month) => (
                    <MenuItem key={month.value} value={month.value} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                onClick={() => handleOpen()}
                sx={{
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  },
                }}
              >
                Add Expense
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>

      {error && (
        <Slide direction="down" in={true} timeout={600}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
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
        </Slide>
      )}

      <Slide direction="up" in={true} timeout={1000}>
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
          <CardContent sx={{ p: 0 }}>
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
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' }, display: { xs: 'none', sm: 'table-cell' } }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' }, display: { xs: 'none', md: 'table-cell' } }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses && expenses.length > 0 ? (
              expenses.map((expense, index) => (
                <Fade in={true} timeout={1200 + index * 100} key={expense._id}>
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
                          {expense.category?.charAt(0)?.toUpperCase() || 'E'}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                            }}
                          >
                            {expense.description}
                          </Typography>
                          <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, mt: 0.5 }}>
                            <Chip
                              label={expense.category}
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
                              {new Date(expense.date).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short' 
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600,
                          color: 'error.main',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                        }}
                      >
                        {formatCurrency(expense.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Chip
                        label={expense.category}
                        size="small"
                        sx={{
                          background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(expense.date).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </Typography>
                    </TableCell>
                <TableCell>
                      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpen(expense)}
                          size={window.innerWidth < 600 ? "small" : "medium"}
                          sx={{
                            borderRadius: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'rgba(33, 150, 243, 0.1)',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                    <EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(expense._id)}
                          size={window.innerWidth < 600 ? "small" : "medium"}
                          sx={{
                            borderRadius: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'rgba(244, 67, 54, 0.1)',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                    <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                </Fade>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ border: 'none', py: { xs: 2, sm: 4 } }}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 },
                  }}>
                    <Fade in={true} timeout={800}>
                      <Box>
                        <Avatar
                          sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 60, sm: 80 },
                            mx: 'auto',
                            mb: { xs: 1.5, sm: 2 },
                            background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
                            boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                          }}
                        >
                          <Receipt sx={{ fontSize: { xs: 30, sm: 40 } }} />
                        </Avatar>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: { xs: 0.75, sm: 1 },
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            background: theme => theme.palette.mode === 'dark'
                              ? 'linear-gradient(45deg, #2196f3, #64b5f6)'
                              : 'linear-gradient(45deg, #1976d2, #2196f3)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          No Expenses Yet!
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color="text.secondary" 
                          sx={{ 
                            mb: { xs: 1.5, sm: 2 }, 
                            maxWidth: { xs: 300, sm: 400 },
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            lineHeight: 1.4,
                          }}
                        >
                          Start tracking your expenses by adding your first expense entry. 
                          Click the "Add Expense" button above to get started.
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                          onClick={() => setOpenDialog(true)}
                          sx={{
                            borderRadius: 3,
                            px: { xs: 3, sm: 4 },
                            py: { xs: 1, sm: 1.5 },
                            fontWeight: 600,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                            },
                          }}
                        >
                          Add Your First Expense
                        </Button>
                      </Box>
                    </Fade>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
          </CardContent>
        </Card>
      </Slide>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        fullScreen={window.innerWidth < 600}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(30, 30, 30, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: theme => theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #2196f3, #64b5f6)'
              : 'linear-gradient(45deg, #1976d2, #2196f3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: '1.3rem',
            textAlign: 'center',
            py: 3,
          }}
        >
          {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
            <ExpenseForm
              expense={selectedExpense}
              onSubmit={handleSubmit}
              onClose={handleClose}
            />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Expenses;
