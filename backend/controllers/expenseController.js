const mongoose = require('mongoose');
const Expense = require('../models/Expense');

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { description, amount, category, date, notes } = req.body;
    const expense = new Expense({
      user: req.user.id,
      description,
      amount,
      category,
      date,
      notes
    });
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const query = { user: req.user.id };

    // Add date filtering if provided
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 });
      
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};

exports.getExpenseStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const query = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get expense trend
    const trend = await Expense.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { 
                format: '%Y-%m-%d',
                date: '$date'
              }
            },
            category: '$category'
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          amount: { $sum: '$amount' },
          categoryBreakdown: {
            $push: {
              category: '$_id.category',
              amount: '$amount'
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          amount: 1,
          categoryBreakdown: 1
        }
      }
    ]);

    // Get category distribution
    const distribution = await Expense.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: 1
        }
      }
    ]);

    // Calculate summary statistics
    const summary = await Expense.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const days = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    const stats = summary[0] || { totalAmount: 0, count: 0 };

    res.json({
      trend,
      distribution,
      summary: {
        total: stats.totalAmount,
        average: stats.totalAmount / (days || 1),
        count: stats.count
      }
    });

  } catch (error) {
    console.error('Error fetching expense statistics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch expense statistics',
      error: error.message 
    });
  }
}; 