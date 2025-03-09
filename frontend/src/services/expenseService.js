import axios from 'axios';

const API_URL = 'http://localhost:5000/api/expenses';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const getExpenses = async (filters = {}) => {
  try {
    const params = {};
    if (filters.startDate) {
      params.startDate = filters.startDate.toISOString();
    }
    if (filters.endDate) {
      params.endDate = filters.endDate.toISOString();
    }

    const response = await axios.get(API_URL, {
      ...getAuthHeader(),
      params
    });
    return response.data;
  } catch (error) {
    console.error('Get expenses error:', error);
    throw error.response?.data || error;
  }
};

export const getExpenseStatistics = async (dateRange = {}) => {
  try {
    const params = { ...dateRange };
    const response = await axios.get(`${API_URL}/statistics`, {
      ...getAuthHeader(),
      params
    });
    return response.data;
  } catch (error) {
    console.error('Get statistics error:', error);
    throw error.response?.data || error;
  }
};

export const createExpense = async (expenseData) => {
  try {
    const response = await axios.post(API_URL, expenseData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Create expense error:', error);
    throw error.response?.data || error;
  }
};

export const updateExpense = async (id, expenseData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, expenseData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Update expense error:', error);
    throw error.response?.data || error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Delete expense error:', error);
    throw error.response?.data || error;
  }
};
