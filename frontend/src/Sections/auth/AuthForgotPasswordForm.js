import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, TextField, Alert, Typography, Link, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants';

// ----------------------------------------------------------------------

export default function AuthForgotPasswordForm() {
  const navigate = useNavigate();
  const showNotification = useNotification();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation Schema
  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });

  // Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setErrorMessage('');
    try {
      // Connect to Python Backend (Mocking for now if endpoint not ready)
      const response = await axios.post('http://localhost:5000/api/user/forgot-password', {
        email: data.email,
      });

      if (response.status === 200) {
        setIsSuccess(true);
        showNotification('Password reset link sent to your email!', 'success');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
      showNotification(msg, 'error');
    }
  };

  if (isSuccess) {
    return (
      <Stack spacing={3} sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Check Your Email
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 5 }}>
          We have sent a password recover instruction to your email.
        </Typography>
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Back to Login
        </Button>
      </Stack>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Typography variant="h4" gutterBottom>
          Forgot Password?
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </Typography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <TextField
          fullWidth
          label="Email address"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{
            py: 1.5,
            bgcolor: 'primary.main',
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
          Reset Password
        </LoadingButton>

        <Link
          component="button"
          variant="subtitle2"
          onClick={() => navigate(ROUTES.LOGIN)}
          sx={{ mt: 3, mx: 'auto', display: 'block', textAlign: 'center' }}
        >
          Back to Login
        </Link>
      </Stack>
    </form>
  );
}
