// @mui
import { Stack, Typography, Box, Grid } from '@mui/material';
import AuthLoginForm from './AuthLoginForm';

// ----------------------------------------------------------------------

export default function Login() {
  return (
      <Box sx={{ 
        backgroundSize: 'cover',
        backgroundImage: 'url(/components/Images/exam-paper.jpg)', 
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Box sx={{width: '100%', maxWidth: 400, boxShadow: 3 }}>
          <Grid container>
            <Grid>
              <Stack   direction="row" alignItems="center" sx={{ mb: 3, color: 'black', p:2 }}>
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
      </Box>
  );
}
