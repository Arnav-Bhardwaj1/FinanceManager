import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Savings as SavingsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useSavingsGoals } from '../context/SavingsContext';
import { useTheme } from '../context/ThemeContext';
import { BackgroundElements } from '../components/BackgroundElements';
import { LoadingSpinner } from '../components/LoadingSpinner';

const goalCategories = [
  'Emergency',
  'Vacation',
  'Car',
  'House',
  'Education',
  'Retirement',
  'Other',
];

const formatDate = (date) => {
  const d = new Date(date);
  const month = d.toLocaleString('default', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    px: 3,
    py: 4,
  },
  header: {
    mb: 4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: theme => `linear-gradient(145deg, 
      ${theme.palette.background.paper} 0%, 
      ${theme.palette.background.paper}E6 100%)`,
    p: 3,
    borderRadius: 3,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
    backdropFilter: 'blur(8px)',
    border: '1px solid',
    borderColor: 'divider',
  },
  addButton: {
    px: 3,
    py: 1.5,
    borderRadius: 3,
    background: theme => `linear-gradient(45deg, 
      ${theme.palette.primary.main}, 
      ${theme.palette.primary.light})`,
    boxShadow: '0 4px 12px rgba(33,150,243,0.3)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(33,150,243,0.4)',
      background: theme => `linear-gradient(45deg, 
        ${theme.palette.primary.dark}, 
        ${theme.palette.primary.main})`,
    },
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: theme => `linear-gradient(145deg, 
      ${theme.palette.background.paper} 0%, 
      ${theme.palette.background.paper}E6 100%)`,
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 12px 30px 0 rgba(0,0,0,0.1)',
    },
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    p: 3,
  },
  progressSection: {
    mt: 'auto',
    pt: 2,
  },
  goalAmount: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme => theme.palette.primary.main,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    my: 2,
    '& .MuiLinearProgress-bar': {
      background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
      transition: 'transform 0.8s ease-in-out',
    },
  },
  actionButtons: {
    display: 'flex',
    gap: 1,
    '& .MuiIconButton-root': {
      color: theme => theme.palette.text.secondary,
      '&:hover': {
        color: theme => theme.palette.primary.main,
        background: theme => theme.palette.action.hover,
      },
    },
  },
};

const SavingsGoals = () => {
  const {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
  } = useSavingsGoals();

  const theme = useTheme();

  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [openContributionDialog, setOpenContributionDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    category: '',
    targetDate: '',
    description: '',
  });
  const [contributionData, setContributionData] = useState({
    amount: '',
    note: '',
  });

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenGoalDialog = (goal = null) => {
    if (goal) {
      const targetDate = new Date(goal.targetDate);
      setFormData({
        title: goal.title,
        targetAmount: goal.targetAmount,
        category: goal.category,
        targetDate: targetDate.toISOString().split('T')[0],
        description: goal.description || '',
      });
      setSelectedGoal(goal);
    } else {
      setFormData({
        title: '',
        targetAmount: '',
        category: '',
        targetDate: '',
        description: '',
      });
      setSelectedGoal(null);
    }
    setOpenGoalDialog(true);
  };

  const handleCloseGoalDialog = () => {
    setOpenGoalDialog(false);
    setSelectedGoal(null);
  };

  const handleOpenContributionDialog = (goal) => {
    setSelectedGoal(goal);
    setContributionData({ amount: '', note: '' });
    setOpenContributionDialog(true);
  };

  const handleCloseContributionDialog = () => {
    setOpenContributionDialog(false);
    setSelectedGoal(null);
  };

  const handleOpenHistoryDialog = (goal) => {
    setSelectedGoal(goal);
    setOpenHistoryDialog(true);
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
    setSelectedGoal(null);
  };

  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    try {
      if (selectedGoal) {
        await updateGoal(selectedGoal._id, formData);
      } else {
        await addGoal(formData);
      }
      handleCloseGoalDialog();
    } catch (err) {
      console.error('Failed to save goal:', err);
    }
  };

  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    try {
      await addContribution(selectedGoal._id, {
        ...contributionData,
        amount: Number(contributionData.amount)
      });
      handleCloseContributionDialog();
    } catch (err) {
      console.error('Failed to add contribution:', err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await deleteGoal(goalId);
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading savings goals..." />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={styles.container}>
      <BackgroundElements />
      
      <Box sx={styles.header}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            background: theme => `linear-gradient(45deg, 
              ${theme.palette.primary.main}, 
              ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Savings Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenGoalDialog()}
          sx={styles.addButton}
        >
          New Goal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {goals.map((goal) => (
          <Grid item xs={12} sm={6} md={4} key={goal._id}>
            <Card sx={styles.card}>
              <CardContent sx={styles.cardContent}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" noWrap>{goal.title}</Typography>
                  <Box sx={styles.actionButtons}>
                    <Tooltip title="View History">
                      <IconButton size="small" onClick={() => handleOpenHistoryDialog(goal)}>
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Contribution">
                      <IconButton size="small" onClick={() => handleOpenContributionDialog(goal)}>
                        <SavingsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenGoalDialog(goal)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteGoal(goal._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography color="textSecondary" variant="body2">
                  {goal.category}
                </Typography>

                <Box sx={styles.progressSection}>
                  <Typography variant="h5" sx={styles.goalAmount}>
                    {formatCurrency(goal.currentAmount)} 
                    <Typography component="span" color="textSecondary" variant="body2">
                      / {formatCurrency(goal.targetAmount)}
                    </Typography>
                  </Typography>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)} 
                    sx={styles.progressBar}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Target: {formatDate(goal.targetDate)}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SavingsIcon />}
                      onClick={() => handleOpenContributionDialog(goal)}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Goal Dialog */}
      <Dialog 
        open={openGoalDialog} 
        onClose={handleCloseGoalDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme => `linear-gradient(145deg, 
              ${theme.palette.background.paper} 0%, 
              ${theme.palette.background.paper}E6 100%)`,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              pointerEvents: 'none',
            },
          },
        }}
      >
        <form onSubmit={handleSubmitGoal}>
          <DialogTitle>
            {selectedGoal ? 'Edit Savings Goal' : 'New Savings Goal'}
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="number"
              label="Target Amount"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {goalCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              type="date"
              label="Target Date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGoalDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedGoal ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Contribution Dialog */}
      <Dialog open={openContributionDialog} onClose={handleCloseContributionDialog}>
        <form onSubmit={handleSubmitContribution}>
          <DialogTitle>Add Contribution</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Amount (₹)"
              type="number"
              fullWidth
              required
              value={contributionData.amount}
              onChange={(e) => setContributionData({ 
                ...contributionData, 
                amount: e.target.value 
              })}
              inputProps={{ 
                min: "0", 
                step: "0.01" 
              }}
            />
            <TextField
              margin="dense"
              label="Note (Optional)"
              type="text"
              fullWidth
              multiline
              rows={2}
              value={contributionData.note}
              onChange={(e) => setContributionData({ 
                ...contributionData, 
                note: e.target.value 
              })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContributionDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* New Goal Form */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Create New Savings Goal</Typography>
        <form onSubmit={handleSubmitGoal}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Goal Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                type="number"
                label="Target Amount"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {goalCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                type="date"
                label="Target Date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Create Goal
          </Button>
        </form>
      </Box>

      {/* Contribution History Dialog */}
      <ContributionHistoryDialog 
        open={openHistoryDialog}
        onClose={handleCloseHistoryDialog}
        goal={selectedGoal}
      />
    </Box>
  );
};

const ContributionHistoryDialog = ({ open, onClose, goal }) => {
  if (!goal) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme => `linear-gradient(145deg, 
            ${theme.palette.background.paper} 0%, 
            ${theme.palette.background.paper}E6 100%)`,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            pointerEvents: 'none',
          },
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Contribution History</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {goal.title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {goal.contributions && goal.contributions.length > 0 ? (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {goal.contributions.sort((a, b) => new Date(b.date) - new Date(a.date)).map((contribution, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  transform: 'translateY(20px)',
                  opacity: 0,
                  animation: 'slideIn 0.3s ease-out forwards',
                  animationDelay: `${index * 0.1}s`,
                  '@keyframes slideIn': {
                    to: {
                      transform: 'translateY(0)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(contribution.amount)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(contribution.date).toLocaleDateString()}
                  </Typography>
                </Box>
                {contribution.note && (
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {contribution.note}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="textSecondary" align="center">
            No contributions yet
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingsGoals;
