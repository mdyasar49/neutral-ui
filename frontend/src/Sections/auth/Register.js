import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// @mui
import { Stack, Typography, Link, Box, Container, Card, keyframes } from '@mui/material';
import AuthRegisterForm from './AuthRegisterForm';

// Define keyframes for the animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ----------------------------------------------------------------------

export default function Register() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title> Register | Neutral UI </title>
      </Helmet>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          backgroundImage: 'radial-gradient(circle at 2% 10%, rgba(32, 101, 209, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(0, 171, 85, 0.05) 0%, transparent 20%)',
          position: 'relative',
          overflow: 'hidden',
          py: 10,
        }}
      >
        {/* Decorative Orbs */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(32, 101, 209, 0.1)', filter: 'blur(80px)' }} />
        <Box sx={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(0, 171, 85, 0.1)', filter: 'blur(100px)' }} />

        <Container maxWidth="sm">
          <Box sx={{ position: 'relative', animation: `${fadeIn} 0.8s ease-out` }}>
            <Card
              sx={{
                p: 5,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: (theme) => theme.customShadows?.z24 || '0 24px 48px 0 rgba(145, 158, 171, 0.2)',
                borderRadius: 3,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 43, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.3)'}`,
              }}
            >
              <Stack spacing={2} sx={{ mb: 5, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  Get Started
                </Typography>

                <Stack direction="row" spacing={0.5} justifyContent="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Already have an account? </Typography>
                  <Link variant="subtitle2" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
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
                <Link underline="always" color="text.primary" href="#">
                  Terms of Service
                </Link>
                {' and '}
                <Link underline="always" color="text.primary" href="#">
                  Privacy Policy
                </Link>
                .
              </Typography>
            </Card>
          </Box>
        </Container>
      </Box>
    </>
  );
}
