import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Stack,
  TextField,
  Typography,
  Container,
  Button,
  Alert,
  keyframes
} from '@mui/material';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

export default function SetupPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showNotification = useNotification();
  
  const email = searchParams.get('email');
  const temp = searchParams.get('temp');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !temp) {
      showNotification('Invalid setup link. Please contact administrator.', 'error');
      navigate(ROUTES.LOGIN);
    }
  }, [email, temp, navigate, showNotification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/user/setup-password', {
        email,
        temp_password: temp,
        new_password: password
      });
      
      showNotification('Password setup successful! You can now login.', 'success');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to setup password.');
    } finally {
      setLoading(false);
    }
  };

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
      <Box sx={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0, 171, 85, 0.1)', filter: 'blur(80px)' }} />
      <Box sx={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(32, 101, 209, 0.1)', filter: 'blur(100px)' }} />

      <Container maxWidth="sm">
        <Box sx={{ position: 'relative', animation: `${fadeIn} 0.8s ease-out` }}>
          <Card sx={{ p: 5, borderRadius: 3, boxShadow: 24 }}>
            <Stack spacing={3} sx={{ mb: 5, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">Set New Password</Typography>
              <Typography color="text.secondary">Welcome to Neutral Academy. Please set your permanent password.</Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Setting up...' : 'Setup Password'}
                </Button>
              </Stack>
            </form>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
