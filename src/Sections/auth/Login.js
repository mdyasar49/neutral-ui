// @mui
import { Stack, Typography, Box, Grid } from '@mui/material';
import AuthLoginForm from './AuthLoginForm';

// ----------------------------------------------------------------------

export default function Login() {
  return (
    <Box
      sx={{
        backgroundSize: 'cover',
        backgroundImage: 'url(/components/Images/exam-paper.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Grid
        container
        sx={{
          width: '100%',
          maxWidth: 400,
          boxShadow: 3,
          display: 'flex',
          justifyContent: 'center', // Center the content horizontally
        }}
      >
        <Grid
          item
          xs={12} // Ensure this grid item takes full width of the container
          sx={{
            padding: 2, // Add padding for inner spacing
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" alignItems="center" sx={{ mb: 3, color: 'black' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                Sign in
              </Typography>
              <Typography>Enter your details below.</Typography>
            </Box>
          </Stack>
          <AuthLoginForm />
        </Grid>
      </Grid>
    </Box>
  );
}
