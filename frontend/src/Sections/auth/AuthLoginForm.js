import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Stack, IconButton, InputAdornment, TextField, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';

// ----------------------------------------------------------------------

export default function AuthLoginForm() {
  const navigate = useNavigate();
  const showNotification = useNotification();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/user/login', { 
        user_email: email, 
        user_password: password 
      });

      console.log('Login Successful:', response.data);
      const { user_role, user_id, token, role, id, firstName, lastName, email: userEmail } = response.data;
      
      // Save token and user info
      if (token) {
        localStorage.setItem('authToken', token);
        const userData = {
            id: user_id || id,
            firstName,
            lastName,
            email: userEmail,
            role: user_role || role
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Success Toast
      showNotification('Login successful! Welcome back.', 'success');
      
      // Navigate to home
      navigate('/home');
      
    } catch (error) {
      console.error('Login Error:', error);
      const message = error.response?.data?.error || error.message || 'Login failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <Stack spacing={3}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <TextField
          name="email"
          label="Email address"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <TextField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
          <Link 
            variant="subtitle2" 
            underline="hover" 
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </Link>
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={loading}
          sx={{
            py: 1.5,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            mb: 2
          }}
        >
          Login
        </LoadingButton>

        <LoadingButton
          fullWidth
          size="large"
          variant="outlined"
          onClick={() => navigate('/register')}
          sx={{
             py: 1.5,
             mt: 1,
             color: 'primary.main',
             borderColor: 'primary.main',
             '&:hover': {
               borderColor: 'primary.dark',
               bgcolor: 'rgba(32, 101, 209, 0.04)'
             }
          }}
        >
          Register Account
        </LoadingButton>
      </Stack>
    </form>
  );
}
