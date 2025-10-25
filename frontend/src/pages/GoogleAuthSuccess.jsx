import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        
        if (token && userParam) {
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          // Store the token and user data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Update AuthContext state
          setUser(userData);
          
          // Navigate to analytics page
          navigate('/analytics');
        } else {
          // Handle error case
          navigate('/login?error=google_auth_failed');
        }
      } catch (error) {
        console.error('Google auth error:', error);
        navigate('/login?error=google_auth_failed');
      }
    };

    handleGoogleAuth();
  }, [navigate, searchParams, setUser]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
        Signing you in...
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        Please wait while we complete your Google authentication
      </Typography>
    </Box>
  );
};

export default GoogleAuthSuccess;

