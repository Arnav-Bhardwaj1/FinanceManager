import { createContext, useContext, useState, useCallback } from 'react';
import { getExpenses, getExpenseStatistics } from '../services/expenseService';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async (dateRange) => {
    try {
      setLoading(true);
      const data = await getExpenses(dateRange);
      setExpenses(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async (dateRange) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpenseStatistics(dateRange);
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async (dateRange) => {
    try {
      setLoading(true);
      await Promise.all([
        fetchExpenses(dateRange),
        fetchStats(dateRange)
      ]);
    } catch (err) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [fetchExpenses, fetchStats]);

  return (
    <ExpenseContext.Provider 
      value={{
        expenses,
        stats,
        loading,
        error,
        fetchExpenses,
        fetchStats,
        refreshData,
        setError
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
