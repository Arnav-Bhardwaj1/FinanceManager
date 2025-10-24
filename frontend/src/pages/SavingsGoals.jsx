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
  Fade,
  Slide,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Savings as SavingsIcon,
  History as HistoryIcon,
  AccountBalanceWallet,
  AttachMoney,
  Category,
  CalendarToday,
  Description,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Timeline,
  PieChart,
  Assessment,
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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

const getGoalStatus = (goal) => {
  const now = new Date();
  const targetDate = new Date(goal.targetDate);
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
  
  if (progress >= 100) {
    return { status: 'completed', color: 'success', icon: CheckCircle };
  } else if (daysRemaining < 0) {
    return { status: 'overdue', color: 'error', icon: Warning };
  } else if (daysRemaining < 30) {
    return { status: 'urgent', color: 'warning', icon: Warning };
  } else {
    return { status: 'on-track', color: 'primary', icon: TrendingUp };
  }
};

const calculateGoalStats = (goals) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => (goal.currentAmount / goal.targetAmount) >= 1).length;
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
  
  return {
    totalGoals,
    completedGoals,
    totalTargetAmount,
    totalCurrentAmount,
    overallProgress,
    remainingAmount: totalTargetAmount - totalCurrentAmount
  };
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    px: { xs: 2, sm: 3 },
    py: { xs: 2, sm: 4 },
  },
  header: {
    mb: { xs: 2, sm: 4 },
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', sm: 'center' },
    gap: { xs: 2, sm: 0 },
    background: theme => `linear-gradient(145deg, 
      ${theme.palette.background.paper} 0%, 
      ${theme.palette.background.paper}E6 100%)`,
    p: { xs: 2, sm: 3 },
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

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{
          background: theme => theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: 'primary.main',
              mb: 2,
            }} 
          />
          <Typography variant="h6" color="text.secondary">
            Loading Savings Goals...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(244, 67, 54, 0.1)'
              : 'rgba(244, 67, 54, 0.05)',
            border: '1px solid',
            borderColor: 'error.main',
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <BackgroundElements />
      
      {/* Header Section */}
      <Fade in={true} timeout={800}>
      <Box sx={styles.header}>
          <Box>
        <Typography 
          variant="h4" 
          sx={{ 
                fontWeight: 700,
            background: theme => `linear-gradient(45deg, 
              ${theme.palette.primary.main}, 
              ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: { xs: 1, sm: 1.5 },
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem', lg: '2.5rem' },
          }}
        >
          Savings Goals
        </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Track your financial aspirations and build wealth
            </Typography>
          </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenGoalDialog()}
          sx={styles.addButton}
        >
          New Goal
        </Button>
      </Box>
      </Fade>

      {/* Statistics Overview */}
      {goals.length > 0 && (
        <Fade in={true} timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Overview
            </Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
              {(() => {
                const stats = calculateGoalStats(goals);
                return (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          background: theme => theme.palette.mode === 'dark'
                            ? 'rgba(30, 30, 30, 0.8)'
                            : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
                            borderRadius: '12px 12px 0 0',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
                              mx: 'auto',
                              mb: 1,
                              width: 40,
                              height: 40,
                            }}
                          >
                            <Assessment sx={{ fontSize: 22 }} />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {stats.totalGoals}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Goals
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          background: theme => theme.palette.mode === 'dark'
                            ? 'rgba(30, 30, 30, 0.8)'
                            : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #4caf50, #81c784)',
                            borderRadius: '12px 12px 0 0',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              background: 'linear-gradient(45deg, #4caf50, #81c784)',
                              mx: 'auto',
                              mb: 1,
                              width: 40,
                              height: 40,
                            }}
                          >
                            <CheckCircle sx={{ fontSize: 22 }} />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {stats.completedGoals}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Completed
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          background: theme => theme.palette.mode === 'dark'
                            ? 'rgba(30, 30, 30, 0.8)'
                            : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #ff9800, #ffb74d)',
                            borderRadius: '12px 12px 0 0',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                              mx: 'auto',
                              mb: 1,
                              width: 40,
                              height: 40,
                            }}
                          >
                            <AccountBalanceWallet sx={{ fontSize: 22 }} />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            {formatCurrency(stats.totalCurrentAmount)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Saved
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          background: theme => theme.palette.mode === 'dark'
                            ? 'rgba(30, 30, 30, 0.8)'
                            : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #9c27b0, #ba68c8)',
                            borderRadius: '12px 12px 0 0',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                              mx: 'auto',
                              mb: 1,
                              width: 40,
                              height: 40,
                            }}
                          >
                            <Timeline sx={{ fontSize: 22 }} />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                            {Math.round(stats.overallProgress)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Overall Progress
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                );
              })()}
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {goals.map((goal, index) => {
            const goalStatus = getGoalStatus(goal);
            const StatusIcon = goalStatus.icon;
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <Grid item xs={12} sm={6} lg={4} key={goal._id}>
                <Slide direction="up" in={true} timeout={600 + index * 200}>
                  <Card 
                    sx={{
                      ...styles.card,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                        borderRadius: '12px 12px 0 0',
                      },
                    }}
                  >
              <CardContent sx={styles.cardContent}>
                      {/* Header with Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          >
                            {goal.category?.charAt(0)?.toUpperCase() || 'S'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                              {goal.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={goal.category}
                                size="small"
                                sx={{
                                  background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                                  color: 'white',
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                  height: 20,
                                }}
                              />
                              <Chip
                                icon={<StatusIcon sx={{ fontSize: 14 }} />}
                                label={goalStatus.status.replace('-', ' ')}
                                size="small"
                                color={goalStatus.color}
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            </Box>
                          </Box>
                        </Box>
                  <Box sx={styles.actionButtons}>
                    <Tooltip title="View History">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenHistoryDialog(goal)}
                              sx={{
                                borderRadius: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(33, 150, 243, 0.1)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Contribution">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenContributionDialog(goal)}
                              sx={{
                                borderRadius: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(76, 175, 80, 0.1)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                        <SavingsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenGoalDialog(goal)}
                              sx={{
                                borderRadius: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(255, 193, 7, 0.1)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteGoal(goal._id)}
                              sx={{
                                borderRadius: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(244, 67, 54, 0.1)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                      {/* Description */}
                      {goal.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 2, fontStyle: 'italic' }}
                        >
                          {goal.description}
                </Typography>
                      )}

                      {/* Progress Section */}
                <Box sx={styles.progressSection}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" sx={styles.goalAmount}>
                    {formatCurrency(goal.currentAmount)} 
                    <Typography component="span" color="textSecondary" variant="body2">
                      / {formatCurrency(goal.targetAmount)}
                    </Typography>
                  </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {Math.round(progress)}%
                          </Typography>
                        </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                          value={progress} 
                          sx={{
                            ...styles.progressBar,
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                              transition: 'transform 0.8s ease-in-out',
                            },
                          }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Box>
                    <Typography variant="body2" color="textSecondary">
                      Target: {formatDate(goal.targetDate)}
                    </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`}
                            </Typography>
                          </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SavingsIcon />}
                      onClick={() => handleOpenContributionDialog(goal)}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              },
                            }}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
                </Slide>
          </Grid>
            );
          })}
      </Grid>
      ) : (
        /* Empty State */
        <Fade in={true} timeout={1200}>
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(30, 30, 30, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <SavingsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              No Savings Goals Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              Start building your financial future by creating your first savings goal. 
              Track your progress and achieve your dreams!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenGoalDialog()}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                },
              }}
            >
              Create Your First Goal
            </Button>
          </Box>
        </Fade>
      )}

      {/* Goal Dialog */}
      <Dialog 
        open={openGoalDialog} 
        onClose={handleCloseGoalDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(30, 30, 30, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <form onSubmit={handleSubmitGoal}>
          <DialogTitle
            sx={{
              background: theme => `linear-gradient(45deg, 
                ${theme.palette.primary.main}, 
                ${theme.palette.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.3rem',
              textAlign: 'center',
              py: 3,
            }}
          >
            {selectedGoal ? 'Edit Savings Goal' : 'New Savings Goal'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="number"
              label="Target Amount"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Category sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                },
              }}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceWallet sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={handleCloseGoalDialog}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                },
              }}
            >
              {selectedGoal ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Contribution Dialog */}
      <Dialog 
        open={openContributionDialog} 
        onClose={handleCloseContributionDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(30, 30, 30, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <form onSubmit={handleSubmitContribution}>
          <DialogTitle
            sx={{
              background: theme => `linear-gradient(45deg, 
                ${theme.palette.success.main}, 
                ${theme.palette.success.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.3rem',
              textAlign: 'center',
              py: 3,
            }}
          >
            Add Contribution
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                },
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={handleCloseContributionDialog}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                },
              }}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme => theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: theme => `linear-gradient(45deg, 
            ${theme.palette.primary.main}, 
            ${theme.palette.primary.light})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          fontSize: '1.3rem',
          textAlign: 'center',
          py: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <HistoryIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Contribution History
            </Typography>
            <Typography variant="body2" color="text.secondary">
            {goal.title}
          </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Goal Summary */}
        <Card
          sx={{
            mb: 3,
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Goal Progress
              </Typography>
              <Chip
                label={`${Math.round((goal.currentAmount / goal.targetAmount) * 100)}% Complete`}
                color="primary"
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                  {formatCurrency(goal.currentAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Amount
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {formatCurrency(goal.targetAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Target Amount
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                  {formatCurrency(goal.targetAmount - goal.currentAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Remaining
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)} 
              sx={{
                mt: 2,
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
                  borderRadius: 4,
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Contributions List */}
        {goal.contributions && goal.contributions.length > 0 ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Contributions ({goal.contributions.length})
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {goal.contributions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((contribution, index) => (
                  <Fade in={true} timeout={800 + index * 100} key={index}>
                    <ListItem
                sx={{
                        mb: 1,
                  borderRadius: 2,
                        background: theme => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid',
                  borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: theme => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.05)',
                          transform: 'translateX(8px)',
                  },
                }}
              >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                            width: 40,
                            height: 40,
                          }}
                        >
                          <AttachMoney sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(contribution.amount)}
                  </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(contribution.date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                  </Typography>
                </Box>
                        }
                        secondary={
                          contribution.note && (
                            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {contribution.note}
                  </Typography>
                          )
                        }
                      />
                    </ListItem>
                  </Fade>
                ))}
            </List>
          </Box>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <SavingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No contributions yet
          </Typography>
            <Typography variant="body2" color="text.secondary">
              Start contributing to this goal to see your progress here
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingsGoals;
