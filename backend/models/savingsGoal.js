const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Emergency', 'Vacation', 'Car', 'House', 'Education', 'Retirement', 'Other']
  },
  targetDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  contributions: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate progress percentage
savingsGoalSchema.methods.getProgress = function() {
  return (this.currentAmount / this.targetAmount) * 100;
};

// Calculate monthly savings needed
savingsGoalSchema.methods.getRequiredMonthlySaving = function() {
  const today = new Date();
  const targetDate = new Date(this.targetDate);
  const monthsLeft = (targetDate.getFullYear() - today.getFullYear()) * 12 +
    (targetDate.getMonth() - today.getMonth());
  
  if (monthsLeft <= 0) return 0;
  
  const remainingAmount = this.targetAmount - this.currentAmount;
  return remainingAmount / monthsLeft;
};

// Export model only if it hasn't been compiled yet
module.exports = mongoose.models.SavingsGoal || mongoose.model('SavingsGoal', savingsGoalSchema);
