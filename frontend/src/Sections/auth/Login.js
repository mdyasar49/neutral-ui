// @mui
import { Stack, Typography, Box, keyframes, Container, Card } from '@mui/material';
import AuthLoginForm from './AuthLoginForm';

// Define keyframes for the animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// ----------------------------------------------------------------------

export default function Login() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: 'radial-gradient(circle at 2% 10%, rgba(0, 171, 85, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(32, 101, 209, 0.05) 0%, transparent 20%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Orbs */}
      <Box sx={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0, 171, 85, 0.1)', filter: 'blur(80px)' }} />
      <Box sx={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(32, 101, 209, 0.1)', filter: 'blur(100px)' }} />

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
            <Stack spacing={3} sx={{ mb: 5, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                Sign in
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Enter your details to access your account.
              </Typography>
            </Stack>

            <AuthLoginForm />
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
