const express = require('express');
const router = express.Router();
const savingsGoalController = require('../controllers/savingsGoalController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.protect);

// Get all savings goals for the authenticated user
router.get('/', savingsGoalController.getAllGoals);

// Create a new savings goal
router.post('/', savingsGoalController.createGoal);

// Get a specific savings goal by ID
router.get('/:id', savingsGoalController.getGoalById);

// Update a specific savings goal
router.put('/:id', savingsGoalController.updateGoal);

// Delete a specific savings goal
router.delete('/:id', savingsGoalController.deleteGoal);

// Add a contribution to a specific savings goal
router.post('/:id/contributions', savingsGoalController.addContribution);

module.exports = router;
