const express = require('express');
const router = express.Router();
const {
  createOrUpdateBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStatistics,
  getBudgetAlerts,
  triggerBudgetCheck
} = require('../controllers/budgetController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create or update budget
router.post('/', createOrUpdateBudget);

// Get all budgets (optionally filtered by month)
router.get('/', getBudgets);

// Get budget statistics for a month
router.get('/statistics', getBudgetStatistics);

// Get budget alerts
router.get('/alerts', getBudgetAlerts);

// Manual trigger budget check (for testing)
router.post('/check', triggerBudgetCheck);

// Get specific budget by ID
router.get('/:id', getBudgetById);

// Update budget
router.put('/:id', updateBudget);

// Delete budget
router.delete('/:id', deleteBudget);

module.exports = router;
