import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { Stack, Typography, Link } from '@mui/material';
import AuthRegisterForm from './AuthRegisterForm';
import { Helmet } from 'react-helmet-async';

// ----------------------------------------------------------------------

export default function Register() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Register</title>
      </Helmet> 

      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">Get started absolutely free.</Typography>

        <Stack direction="row" spacing={0.5} sx={{ cursor: 'pointer' }}>
          <Typography variant="body2">Already have an account? </Typography>

          <Link variant="subtitle2" onClick={() => navigate('/login')}>
            Sign in
          </Link>
        </Stack>
      </Stack>

      <AuthRegisterForm />

      <Typography
        component="div"
        sx={{ color: 'text.secondary', mt: 3, typography: 'caption', textAlign: 'center' }}
      >
        {'By signing up, I agree to '}
        <Link underline="always" color="text.primary">
          Terms of Service
        </Link>
        {' and '}
        <Link underline="always" color="text.primary">
          Privacy Policy
        </Link>
        .
      </Typography>
    </>
  );
}
