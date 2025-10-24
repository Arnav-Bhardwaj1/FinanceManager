import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Chip,
  Fade,
  Slide,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Receipt,
  Assessment,
  Logout,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Savings,
  AccountBalanceWallet as WalletIcon,
  Psychology as AIBrainIcon,
  ChatBubbleOutline as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const drawerWidth = 220;

// Responsive breakpoints
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChatbotOpen = () => {
    // Trigger the Chatbase chatbot
    if (window.chatbase) {
      window.chatbase('open');
    }
  };

  const menuItems = [
    { text: 'Analytics', icon: <Assessment />, path: '/analytics' },
    { text: 'Expenses', icon: <Receipt />, path: '/expenses' },
    { text: 'Savings Goals', icon: <Savings />, path: '/savings' },
  ];

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: theme => theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme => theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 20%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Fade in={true} timeout={800}>
          <Box>
            <Avatar
              sx={{
                width: { xs: 48, sm: 64 },
                height: { xs: 48, sm: 64 },
                mx: 'auto',
                mb: { xs: 1.5, sm: 2 },
                background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
              }}
            >
              <WalletIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
            </Avatar>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: theme => theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #2196f3, #64b5f6)'
                  : 'linear-gradient(45deg, #1976d2, #2196f3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.2rem' },
              }}
            >
          Finance Manager
        </Typography>
            {user && (
              <Chip
                label={user.name || 'User'}
                size="small"
                sx={{
                  background: 'rgba(33, 150, 243, 0.1)',
                  color: 'primary.main',
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  height: { xs: 20, sm: 24 },
                }}
              />
            )}
          </Box>
        </Fade>
      </Box>

      {/* Navigation */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <List sx={{ px: { xs: 1, sm: 1.5 }, py: 0.5 }}>
          {menuItems.map((item, index) => (
            <Slide
              key={item.text}
              direction="right"
              in={true}
              timeout={600 + index * 100}
            >
          <ListItem
            button
            onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  py: 1,
                  transition: 'all 0.3s ease',
                  background: location.pathname === item.path
                    ? theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                    : 'transparent',
                  color: location.pathname === item.path ? 'white' : 'inherit',
                  '&:hover': {
                    background: theme => theme.palette.action.hover,
                    transform: 'translateX(6px)',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: location.pathname === item.path ? 'white' : 'inherit',
                    transition: 'color 0.3s ease',
                    minWidth: 36,
                  },
                  '& .MuiListItemText-root': {
                    '& .MuiTypography-root': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                  },
                }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
          </ListItem>
            </Slide>
          ))}
        </List>

        <Divider sx={{ mx: { xs: 1, sm: 1.5 }, my: 1 }} />

        {/* AI Chatbot Section */}
        <Box sx={{ px: { xs: 1, sm: 1.5 }, pb: 1 }}>
          <Slide direction="right" in={true} timeout={900}>
            <Box
              sx={{
                borderRadius: 2,
                p: { xs: 1.5, sm: 2 },
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(33, 150, 243, 0.08)'
                  : 'rgba(33, 150, 243, 0.05)',
                border: '1px solid',
                borderColor: theme => theme.palette.mode === 'dark'
                  ? 'rgba(33, 150, 243, 0.2)'
                  : 'rgba(33, 150, 243, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: theme => theme.palette.mode === 'dark'
                    ? 'rgba(33, 150, 243, 0.12)'
                    : 'rgba(33, 150, 243, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar
                  sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    mr: { xs: 1, sm: 1.5 },
                    background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
                    boxShadow: '0 3px 8px rgba(33, 150, 243, 0.3)',
                  }}
                >
                  <AIBrainIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </Avatar>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  AI Assistant
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  lineHeight: 1.4,
                  display: 'block',
                  mb: 1.5,
                }}
              >
                Get instant financial insights and personalized recommendations
              </Typography>
              <Box
                onClick={handleChatbotOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 1,
                  px: 2,
                  borderRadius: 1.5,
                  background: theme => theme.palette.mode === 'dark'
                    ? 'rgba(33, 150, 243, 0.1)'
                    : 'rgba(33, 150, 243, 0.05)',
                  border: '1px solid',
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(33, 150, 243, 0.3)'
                    : 'rgba(33, 150, 243, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: theme => theme.palette.mode === 'dark'
                      ? 'rgba(33, 150, 243, 0.15)'
                      : 'rgba(33, 150, 243, 0.1)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <ChatIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
                  Chat Now
                </Typography>
              </Box>
            </Box>
          </Slide>
        </Box>

        <Divider sx={{ mx: { xs: 1, sm: 1.5 }, my: 1 }} />

        {/* Logout Button */}
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Slide direction="right" in={true} timeout={1000}>
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: 1.5,
                py: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'error.main',
                  color: 'white',
                  transform: 'translateX(6px)',
                  boxShadow: '0 3px 8px rgba(244, 67, 54, 0.3)',
                },
                '& .MuiListItemIcon-root': {
                  transition: 'color 0.3s ease',
                  minWidth: 36,
                },
                '& .MuiListItemText-root': {
                  '& .MuiTypography-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  },
                },
                '&:hover .MuiListItemIcon-root': {
                  color: 'white',
                },
              }}
            >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
          </Slide>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: theme => theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #2196f3, #f50057, #4caf50)',
          },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: theme => theme.palette.text.primary,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: theme => theme.palette.text.primary,
              fontWeight: 600,
            }}
          >
            Finance Manager
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={toggleDarkMode}
            sx={{
              color: theme => theme.palette.text.primary,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: theme => theme.palette.action.hover,
                transform: 'scale(1.1)',
              },
            }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          background: theme => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
          minHeight: 'calc(100vh - 64px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme => theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 0, 87, 0.05) 0%, transparent 50%)'
              : 'radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 0, 87, 0.03) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
