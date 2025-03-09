const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.post('/', expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/statistics', expenseController.getExpenseStatistics);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
