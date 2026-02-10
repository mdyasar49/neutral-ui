import { Helmet } from 'react-helmet-async';
import { Container, Card, Box } from '@mui/material';
import AuthForgotPasswordForm from '../../Sections/auth/AuthForgotPasswordForm';

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Forgot Password | Neutral UI </title>
      </Helmet>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          backgroundImage: 'radial-gradient(circle at 2% 10%, rgba(0, 171, 85, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(32, 101, 209, 0.05) 0%, transparent 20%)',
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              p: 5,
              width: '100%',
              boxShadow: (theme) => theme.customShadows?.z24 || '0 24px 48px 0 rgba(145, 158, 171, 0.2)',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 43, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.3)'}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                bgcolor: 'primary.main',
              }
            }}
          >
            <AuthForgotPasswordForm />
          </Card>
        </Container>
      </Box>
    </>
  );
}
