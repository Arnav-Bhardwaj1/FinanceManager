const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const { checkAndSendBudgetNotifications } = require('../services/budgetNotificationService');

// Create or update budget
exports.createOrUpdateBudget = async (req, res) => {
  try {
    const { category, amount, month, description, notifications } = req.body;

    if (!category || !amount || !month) {
      return res.status(400).json({ 
        message: 'Please provide category, amount, and month' 
      });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ 
        message: 'Month must be in YYYY-MM format' 
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { 
        user: req.user.id, 
        category, 
        month 
      },
      {
        user: req.user.id,
        category,
        amount,
        month,
        description: description || '',
        notifications: notifications || { enabled: true, threshold: 80 },
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true 
      }
    );

    // Trigger immediate budget check if notifications are enabled
    if (budget.notifications.enabled) {
      // Run check in background (don't wait for it)
      checkAndSendBudgetNotifications().catch(err => {
        console.error('Error in immediate budget check:', err);
      });
    }

    res.status(201).json(budget);
  } catch (error) {
    console.error('Create/Update budget error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Budget already exists for this category and month' 
      });
    }
    
    res.status(500).json({ message: 'Failed to create/update budget' });
  }
};

// Get all budgets for a specific month
exports.getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    const query = { user: req.user.id };

    if (month) {
      query.month = month;
    }

    const budgets = await Budget.find(query).sort({ category: 1 });

    // Get spending data for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const [year, monthNum] = budget.month.split('-');
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        const expenses = await Expense.find({
          user: req.user.id,
          category: budget.category,
          date: { $gte: startDate, $lte: endDate }
        });

        const spentAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = budget.getRemaining(spentAmount);
        const usagePercentage = budget.getUsagePercentage(spentAmount);
        const isExceeded = budget.isExceeded(spentAmount);
        const transactionCount = expenses.length;

        return {
          ...budget.toObject(),
          spentAmount,
          remaining,
          usagePercentage: Math.round(usagePercentage * 100) / 100,
          isExceeded,
          transactionCount
        };
      })
    );

    res.json(budgetsWithSpending);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Failed to fetch budgets' });
  }
};

// Get budget statistics for a month
exports.getBudgetStatistics = async (req, res) => {
  try {
    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required' });
    }

    const budgets = await Budget.find({ 
      user: req.user.id, 
      month 
    });

    if (budgets.length === 0) {
      return res.json({
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallUsage: 0,
        categoryBreakdown: [],
        exceededBudgets: 0,
        onTrackBudgets: 0
      });
    }

    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const categoryBreakdown = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await Expense.find({
          user: req.user.id,
          category: budget.category,
          date: { $gte: startDate, $lte: endDate }
        });

        const spentAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = budget.getRemaining(spentAmount);
        const usagePercentage = budget.getUsagePercentage(spentAmount);

        return {
          category: budget.category,
          budgetAmount: budget.amount,
          spentAmount,
          remaining,
          usagePercentage: Math.round(usagePercentage * 100) / 100,
          isExceeded: budget.isExceeded(spentAmount),
          transactionCount: expenses.length
        };
      })
    );

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = categoryBreakdown.reduce((sum, cat) => sum + cat.spentAmount, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const exceededBudgets = categoryBreakdown.filter(cat => cat.isExceeded).length;
    const onTrackBudgets = categoryBreakdown.length - exceededBudgets;

    res.json({
      totalBudget,
      totalSpent,
      totalRemaining,
      overallUsage: Math.round(overallUsage * 100) / 100,
      categoryBreakdown,
      exceededBudgets,
      onTrackBudgets,
      totalCategories: budgets.length
    });
  } catch (error) {
    console.error('Get budget statistics error:', error);
    res.status(500).json({ message: 'Failed to fetch budget statistics' });
  }
};

// Get a specific budget by ID
exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Get spending for this budget
    const [year, monthNum] = budget.month.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user.id,
      category: budget.category,
      date: { $gte: startDate, $lte: endDate }
    });

    const spentAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      ...budget.toObject(),
      spentAmount,
      remaining: budget.getRemaining(spentAmount),
      usagePercentage: Math.round(budget.getUsagePercentage(spentAmount) * 100) / 100,
      isExceeded: budget.isExceeded(spentAmount),
      transactionCount: expenses.length
    });
  } catch (error) {
    console.error('Get budget by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch budget' });
  }
};

// Update budget
exports.updateBudget = async (req, res) => {
  try {
    const { amount, description, notifications } = req.body;

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (amount !== undefined) budget.amount = amount;
    if (description !== undefined) budget.description = description;
    if (notifications !== undefined) budget.notifications = notifications;
    budget.updatedAt = new Date();

    const updatedBudget = await budget.save();
    
    // Trigger immediate budget check if notifications are enabled
    if (updatedBudget.notifications.enabled) {
      checkAndSendBudgetNotifications().catch(err => {
        console.error('Error in immediate budget check:', err);
      });
    }
    
    res.json(updatedBudget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Failed to update budget' });
  }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Failed to delete budget' });
  }
};

// Get budget alerts (categories exceeding threshold)
exports.getBudgetAlerts = async (req, res) => {
  try {
    const { month } = req.query;
    const now = new Date();
    const currentMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgets = await Budget.find({
      user: req.user.id,
      month: currentMonth,
      'notifications.enabled': true
    });

    const alerts = [];

    for (const budget of budgets) {
      const [year, monthNum] = budget.month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);

      const expenses = await Expense.find({
        user: req.user.id,
        category: budget.category,
        date: { $gte: startDate, $lte: endDate }
      });

      const spentAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const usagePercentage = budget.getUsagePercentage(spentAmount);

      if (usagePercentage >= budget.notifications.threshold) {
        alerts.push({
          category: budget.category,
          budgetAmount: budget.amount,
          spentAmount,
          usagePercentage: Math.round(usagePercentage * 100) / 100,
          isExceeded: budget.isExceeded(spentAmount),
          threshold: budget.notifications.threshold,
          message: budget.isExceeded(spentAmount)
            ? `Budget exceeded for ${budget.category}!`
            : `${budget.category} budget is ${usagePercentage.toFixed(1)}% used.`
        });
      }
    }

    res.json(alerts);
  } catch (error) {
    console.error('Get budget alerts error:', error);
    res.status(500).json({ message: 'Failed to fetch budget alerts' });
  }
};

// Manual trigger for budget notification check (for testing/admin)
exports.triggerBudgetCheck = async (req, res) => {
  try {
    const result = await checkAndSendBudgetNotifications();
    res.json({ 
      message: 'Budget check completed',
      ...result 
    });
  } catch (error) {
    console.error('Error triggering budget check:', error);
    res.status(500).json({ message: 'Failed to trigger budget check' });
  }
};