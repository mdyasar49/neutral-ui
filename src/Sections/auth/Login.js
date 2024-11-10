// @mui
import { Stack, Typography, Box } from '@mui/material';
import AuthLoginForm from './AuthLoginForm';

// ----------------------------------------------------------------------

export default function Login() {

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 3, color: 'black'  }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom >
            Sign in 
          </Typography>
          <Typography>Enter your details below.</Typography>
        </Box>
      </Stack>
      <AuthLoginForm />
    </Box>
  );
}
