import { Box } from '@mui/material';

export const BackgroundElements = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      overflow: 'hidden',
      opacity: 0.4,
    }}
  >
    {/* Gradient Orbs */}
    <Box
      sx={{
        position: 'absolute',
        top: '10%',
        right: '15%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0) 70%)',
        filter: 'blur(40px)',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(156,39,176,0.1) 0%, rgba(156,39,176,0) 70%)',
        filter: 'blur(40px)',
      }}
    />
    
    {/* Grid Pattern */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        opacity: 0.5,
      }}
    />
  </Box>
); 