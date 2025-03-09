import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: 2,
    }}
  >
    <CircularProgress
      size={48}
      thickness={4}
      sx={{
        color: theme => theme.palette.primary.main,
      }}
    />
    <Typography variant="body1" color="textSecondary">
      {message}
    </Typography>
  </Box>
); 