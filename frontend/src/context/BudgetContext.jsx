import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getBudgets,
  getBudgetStatistics,
  getBudgetAlerts,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget
} from '../services/budgetService';

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBudgets = useCallback(async (month = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgets(month);
      setBudgets(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching budgets:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgetStatistics(month);
      setStatistics(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching budget statistics:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async (month = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgetAlerts(month);
      setAlerts(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching budget alerts:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addOrUpdateBudget = useCallback(async (budgetData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createOrUpdateBudget(budgetData);
      await fetchBudgets(budgetData.month);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating/updating budget:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBudgets]);

  const updateBudgetItem = useCallback(async (id, budgetData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateBudget(id, budgetData);
      // Refresh budgets if month is provided
      if (budgetData.month) {
        await fetchBudgets(budgetData.month);
      }
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error updating budget:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBudgets]);

  const removeBudget = useCallback(async (id, month = null) => {
    setLoading(true);
    setError(null);
    try {
      await deleteBudget(id);
      if (month) {
        await fetchBudgets(month);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting budget:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBudgets]);

  const refreshData = useCallback(async (month) => {
    if (!month) {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    await Promise.all([
      fetchBudgets(month),
      fetchStatistics(month),
      fetchAlerts(month)
    ]);
  }, [fetchBudgets, fetchStatistics, fetchAlerts]);

  const value = {
    budgets,
    statistics,
    alerts,
    loading,
    error,
    fetchBudgets,
    fetchStatistics,
    fetchAlerts,
    addOrUpdateBudget,
    updateBudgetItem,
    removeBudget,
    refreshData
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
