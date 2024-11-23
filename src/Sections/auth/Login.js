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
        color: 'red'
      }}
    >
      <Grid
        container
        sx={{
          width: '100%',
          maxWidth: 400,
          boxShadow: 3,
          display: 'flex',
          justifyContent: 'center', 
        }}
      >
        <Grid
          item
          xs={12} 
          sx={{
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" alignItems='flex-start' sx={{ mb: 3, color: 'black' }}>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start' }}>
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
