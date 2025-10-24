import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Fade,
  Slide,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/analytics');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 0, 87, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm">
        <Slide direction="up" in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 6,
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2196f3, #f50057, #4caf50)',
              },
            }}
          >
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Fade in={true} timeout={1200}>
                <Box sx={{ mb: 3 }}>
                  <WalletIcon
                    sx={{
                      fontSize: 64,
                      color: theme.palette.primary.main,
                      mb: 2,
                      filter: 'drop-shadow(0 4px 8px rgba(33, 150, 243, 0.3))',
                    }}
                  />
                </Box>
              </Fade>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #2196f3, #64b5f6)'
                    : 'linear-gradient(45deg, #1976d2, #2196f3)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Create Account
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '1.1rem',
                }}
              >
                Join Finance Tracker and start managing your finances
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in={!!error} timeout={300}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: '1.2rem',
                    },
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  required
                  id="name"
                  label="Full Name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${theme.palette.primary.main}20`,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${theme.palette.primary.main}30`,
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  required
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${theme.palette.primary.main}20`,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${theme.palette.primary.main}30`,
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  required
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${theme.palette.primary.main}20`,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${theme.palette.primary.main}30`,
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  required
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${theme.palette.primary.main}20`,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${theme.palette.primary.main}30`,
                      },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                  boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    background: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Already have an account?
                </Typography>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: theme.palette.primary.dark,
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign In
                  </Typography>
                </Link>
              </Box>
            </form>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default Register;
