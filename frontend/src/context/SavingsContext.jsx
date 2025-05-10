import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const SavingsContext = createContext();

export const useSavingsGoals = () => {
  return useContext(SavingsContext);
};

export const SavingsProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get auth header
  const getAuthHeader = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/savings-goals`,
        getAuthHeader()
      );
      setGoals(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch savings goals:', err);
      setError(err.response?.data?.message || 'Failed to fetch savings goals');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch goals when the component mounts and when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchGoals();
    }
  }, [fetchGoals]);

  const addGoal = async (goalData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/savings-goals`,
        goalData,
        getAuthHeader()
      );
      setGoals(prevGoals => [...prevGoals, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Failed to add savings goal:', err);
      setError(err.response?.data?.message || 'Failed to add savings goal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (goalId, updatedData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/savings-goals/${goalId}`,
        updatedData,
        getAuthHeader()
      );
      setGoals(prevGoals => 
        prevGoals.map(goal => goal._id === goalId ? response.data : goal)
      );
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Failed to update savings goal:', err);
      setError(err.response?.data?.message || 'Failed to update savings goal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (goalId) => {
    setLoading(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/api/savings-goals/${goalId}`,
        getAuthHeader()
      );
      setGoals(prevGoals => prevGoals.filter(goal => goal._id !== goalId));
      setError(null);
    } catch (err) {
      console.error('Failed to delete savings goal:', err);
      setError(err.response?.data?.message || 'Failed to delete savings goal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSavingsGoal = async (goalData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/savings-goals`, goalData);
      setGoals(prevGoals => [...prevGoals, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Failed to create savings goal:', err);
      setError(err.response?.data?.message || 'Failed to create savings goal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addContribution = async (goalId, contributionData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/savings-goals/${goalId}/contributions`,
        contributionData,
        getAuthHeader()
      );
      
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal._id === goalId ? response.data : goal
        )
      );
      
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Failed to add contribution:', err);
      setError(err.response?.data?.message || 'Failed to add contribution');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    createSavingsGoal,
    addContribution
  };

  return (
    <SavingsContext.Provider value={value}>
      {children}
    </SavingsContext.Provider>
  );
};
