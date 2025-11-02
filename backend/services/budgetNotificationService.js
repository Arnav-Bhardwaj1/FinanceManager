const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const User = require('../models/User');
const { sendBudgetAlertEmail } = require('./emailService');

// Track last notification sent to avoid spam
const lastNotificationCache = new Map();

// Get cache key for a budget alert
const getCacheKey = (userId, budgetId, month) => {
  return `${userId}-${budgetId}-${month}`;
};

// Check if notification should be sent (avoid duplicates within same day)
const shouldSendNotification = (userId, budgetId, month, usagePercentage) => {
  const cacheKey = getCacheKey(userId, budgetId, month);
  const lastNotification = lastNotificationCache.get(cacheKey);
  
  if (!lastNotification) {
    return true;
  }

  // Send if it's a new day or if usage percentage increased significantly (10%+)
  const now = new Date();
  const lastSentDate = new Date(lastNotification.timestamp);
  const isNewDay = now.toDateString() !== lastSentDate.toDateString();
  const significantIncrease = usagePercentage - lastNotification.usagePercentage >= 10;

  return isNewDay || significantIncrease || (usagePercentage >= 100 && lastNotification.usagePercentage < 100);
};

// Update notification cache
const updateNotificationCache = (userId, budgetId, month, usagePercentage) => {
  const cacheKey = getCacheKey(userId, budgetId, month);
  lastNotificationCache.set(cacheKey, {
    timestamp: new Date(),
    usagePercentage,
  });
};

// Check budgets and send notifications
const checkAndSendBudgetNotifications = async () => {
  try {
    console.log('🔔 Checking budgets for alerts...');
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get all budgets with notifications enabled for current month
    const budgets = await Budget.find({
      month: currentMonth,
      'notifications.enabled': true,
    }).populate('user', 'email name');

    if (budgets.length === 0) {
      console.log('No budgets to check for current month');
      return;
    }

    let alertsSent = 0;
    let errors = 0;

    for (const budget of budgets) {
      try {
        // Get spending for this budget
        const [year, monthNum] = budget.month.split('-');
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        const expenses = await Expense.find({
          user: budget.user._id,
          category: budget.category,
          date: { $gte: startDate, $lte: endDate },
        });

        const spentAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const usagePercentage = budget.getUsagePercentage(spentAmount);
        const isExceeded = budget.isExceeded(spentAmount);

        // Check if threshold is reached
        if (usagePercentage >= budget.notifications.threshold) {
          // Check if we should send notification (avoid spam)
          if (shouldSendNotification(budget.user._id.toString(), budget._id.toString(), budget.month, usagePercentage)) {
            const user = budget.user;
            if (!user || !user.email) {
              console.warn(`User email not found for budget ${budget._id}`);
              continue;
            }

            const budgetData = {
              category: budget.category,
              budgetAmount: budget.amount,
              spentAmount,
              remaining: budget.getRemaining(spentAmount),
              usagePercentage: Math.round(usagePercentage * 100) / 100,
              isExceeded,
              month: new Date(year, monthNum - 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
            };

            // Send email notification
            const emailResult = await sendBudgetAlertEmail(
              user.email,
              user.name || 'User',
              budgetData
            );

            if (emailResult.success) {
              console.log(`✅ Alert sent to ${user.email} for ${budget.category} (${usagePercentage.toFixed(1)}%)`);
              alertsSent++;
              
              // Update cache
              updateNotificationCache(
                budget.user._id.toString(),
                budget._id.toString(),
                budget.month,
                usagePercentage
              );
            } else {
              console.error(`❌ Failed to send alert to ${user.email}:`, emailResult.message);
              errors++;
            }
          } else {
            console.log(`⏭️ Skipping notification for ${budget.category} (already sent today)`);
          }
        }
      } catch (error) {
        console.error(`Error processing budget ${budget._id}:`, error);
        errors++;
      }
    }

    console.log(`📧 Budget check complete: ${alertsSent} alerts sent, ${errors} errors`);
    return { alertsSent, errors, totalChecked: budgets.length };
  } catch (error) {
    console.error('Error in budget notification check:', error);
    throw error;
  }
};

module.exports = {
  checkAndSendBudgetNotifications,
};
