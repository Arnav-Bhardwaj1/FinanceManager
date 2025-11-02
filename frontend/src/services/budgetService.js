import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/budgets`;

export const createOrUpdateBudget = async (budgetData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(budgetData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create/update budget');
  }

  return response.json();
};

export const getBudgets = async (month = null) => {
  const token = localStorage.getItem('token');
  const url = month ? `${API_URL}?month=${month}` : API_URL;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch budgets');
  }

  return response.json();
};

export const getBudgetStatistics = async (month) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/statistics?month=${month}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch budget statistics');
  }

  return response.json();
};

export const getBudgetAlerts = async (month = null) => {
  const token = localStorage.getItem('token');
  const url = month ? `${API_URL}/alerts?month=${month}` : `${API_URL}/alerts`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch budget alerts');
  }

  return response.json();
};

export const updateBudget = async (id, budgetData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(budgetData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update budget');
  }

  return response.json();
};

export const deleteBudget = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete budget');
  }

  return response.json();
};

export const getBudgetById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch budget');
  }

  return response.json();
};
