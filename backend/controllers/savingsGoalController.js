const SavingsGoal = require('../models/savingsGoal');

// Get all savings goals for the authenticated user
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user.id });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    res.status(500).json({ message: 'Failed to fetch savings goals' });
  }
};

// Get a specific savings goal by ID
exports.getGoalById = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Error fetching savings goal:', error);
    res.status(500).json({ message: 'Failed to fetch savings goal' });
  }
};

// Create a new savings goal
exports.createGoal = async (req, res) => {
  try {
    const { 
      title, 
      targetAmount, 
      category, 
      targetDate, 
      description 
    } = req.body;

    // Validate input
    if (!title || !targetAmount || !category || !targetDate) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    const newGoal = new SavingsGoal({
      user: req.user.id,
      title,
      targetAmount,
      currentAmount: 0,
      category,
      targetDate,
      description: description || '',
      isCompleted: false
    });

    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error('Error creating savings goal:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: Object.values(error.errors)
          .map(err => err.message)
          .join(', ') 
      });
    }

    res.status(500).json({ message: 'Failed to create savings goal' });
  }
};

// Update a specific savings goal
exports.updateGoal = async (req, res) => {
  try {
    const { 
      title, 
      targetAmount, 
      category, 
      targetDate, 
      description,
      currentAmount
    } = req.body;

    const goal = await SavingsGoal.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    // Update fields if provided
    if (title) goal.title = title;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (category) goal.category = category;
    if (targetDate) goal.targetDate = targetDate;
    if (description) goal.description = description;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;

    // Check if goal is completed
    goal.isCompleted = goal.currentAmount >= goal.targetAmount;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ message: 'Failed to update savings goal' });
  }
};

// Delete a specific savings goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ message: 'Failed to delete savings goal' });
  }
};

// Add a contribution to a specific savings goal
exports.addContribution = async (req, res) => {
  try {
    const { amount, note } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        message: 'Please provide a valid contribution amount' 
      });
    }

    const goal = await SavingsGoal.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    // Add contribution
    goal.contributions.push({
      amount,
      note: note || '',
      date: new Date()
    });

    // Update current amount
    goal.currentAmount += amount;

    // Check if goal is completed
    goal.isCompleted = goal.currentAmount >= goal.targetAmount;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error adding contribution:', error);
    res.status(500).json({ message: 'Failed to add contribution' });
  }
};

module.exports = {
  getAllGoals: exports.getAllGoals,
  getGoalById: exports.getGoalById,
  createGoal: exports.createGoal,
  updateGoal: exports.updateGoal,
  deleteGoal: exports.deleteGoal,
  addContribution: exports.addContribution,
};
