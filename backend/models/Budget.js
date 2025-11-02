const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: String,
    required: true,
    // Format: YYYY-MM
    match: /^\d{4}-\d{2}$/
  },
  description: {
    type: String,
    trim: true
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 80, // Alert when 80% of budget is spent
      min: 0,
      max: 100
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

// Method to check if budget is exceeded
budgetSchema.methods.isExceeded = function(spentAmount) {
  return spentAmount > this.amount;
};

// Method to get remaining budget
budgetSchema.methods.getRemaining = function(spentAmount) {
  return Math.max(0, this.amount - spentAmount);
};

// Method to get usage percentage
budgetSchema.methods.getUsagePercentage = function(spentAmount) {
  if (this.amount === 0) return 0;
  return Math.min(100, (spentAmount / this.amount) * 100);
};

module.exports = mongoose.model('Budget', budgetSchema);
