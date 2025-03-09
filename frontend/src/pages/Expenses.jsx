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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
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
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
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
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Expenses</Typography>
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
            onClick={() => handleOpen()}
          >
            Add Expense
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{formatCurrency(expense.amount)}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(expense)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(expense._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <ExpenseForm
              expense={selectedExpense}
              onSubmit={handleSubmit}
              onClose={handleClose}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Expenses;
