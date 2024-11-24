// @mui
import { Stack, Typography, Box } from '@mui/material';
import AuthLoginForm from './AuthLoginForm';

// ----------------------------------------------------------------------

export default function Login() {
  return (
    <Box
      sx={{
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/components/Images/exam-paper.jpg)', // Ensure correct image path
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        overflow: 'hidden', // Ensures no overflow from the background
      }}
    >
      {/* Box for form container */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 500, // You can change this width if needed
          padding: 4, // Padding inside the form container
          boxShadow: 3,
          borderRadius: 2, // Rounded corners
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // White background with transparency for the form
        }}
      >
        {/* Title and description */}
        <Stack direction="column" alignItems="center" justifyContent="flex-start" sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'black' }}>
            Sign in
          </Typography>
          <Typography variant="body2" sx={{ color: 'black' }}>
            Enter your details below.
          </Typography>
        </Stack>

        {/* Login form */}
        <AuthLoginForm />
      </Box>
    </Box>
  );
}
