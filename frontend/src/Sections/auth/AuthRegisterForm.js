import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Stack, 
  IconButton, 
  InputAdornment, 
  TextField, 
  Alert, 
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  Button
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Icon } from '@mui/material';
import { Visibility, VisibilityOff, Google, LinkedIn, Twitter } from '@mui/icons-material';
import axios from 'axios';

import { useNotification } from '../../context/NotificationContext';

// ----------------------------------------------------------------------

export default function AuthRegisterForm() {
  const navigate = useNavigate();
  const showNotification = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validation Schema
  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    terms: Yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
  });

  // Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  const onSubmit = async (data) => {
    setErrorMessage('');
    try {
      // Connect to Python Backend
      const response = await axios.post('http://localhost:5000/api/user/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: 'student', // Default role for public registration
      });

      if (response.status === 201) {
        // Success - navigate to login
        showNotification('Registration successful! Please login.', 'success');
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
      showNotification(msg, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

       {/* Social Login (Optional enhancement) */}
        <Stack direction="row" spacing={2}>
          <Button fullWidth size="large" color="inherit" variant="outlined" startIcon={<Google />}>
            Google
          </Button>
          <Button fullWidth size="large" color="inherit" variant="outlined" startIcon={<Twitter />}>
            Twitter
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            OR
          </Typography>
        </Divider>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="First name"
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />

          <TextField
            fullWidth
            label="Last name"
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
        </Stack>

        <TextField
          fullWidth
          label="Email address"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
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

        {/* Terms Checkbox */}
        <FormControlLabel
          control={
            <Checkbox 
              {...register('terms')} 
              checked={watch('terms')}
              color="primary" 
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              I match the public{' '}
              <Link underline="always" color="text.primary" href="#">
                Terms of Service
              </Link>
            </Typography>
          }
        />
        {errors.terms && <Typography variant="caption" color="error">{errors.terms.message}</Typography>}

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{
            py: 1.5,
            bgcolor: 'primary.main', // Use theme primary
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px',
            boxShadow: '0 8px 16px 0 rgba(0, 171, 85, 0.24)',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: 'none',
            },
          }}
        >
          Create Account
        </LoadingButton>
      </Stack>
    </form>
  );
}
