import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  Button,
  Divider,
  Stack
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save as SaveIcon, Lock as LockIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNotification } from '../../context/NotificationContext';

export default function Profile() {
  const showNotification = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const { register, handleSubmit } = useForm({
    defaultValues: user
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);
        showNotification("Profile updated successfully!", "success");
    }, 1000);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
       <Helmet>
        <title> Profile | Neutral UI </title>
      </Helmet>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
           <Card sx={{ textAlign: 'center', p: 3 }}>
              <Avatar 
                src={user.avatar} 
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, boxShadow: 2 }} 
              />
              <Typography variant="h6">{user.firstName} {user.lastName}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{user.email}</Typography>
              <Button variant="outlined" sx={{ mt: 2 }}>Upload Photo</Button>
           </Card>
        </Grid>

        {/* Edit Form */}
        <Grid item xs={12} md={8}>
           <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Edit Details</Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                 <Stack spacing={3}>
                    <Grid container spacing={2}>
                       <Grid item xs={6}>
                          <TextField fullWidth label="First Name" {...register('firstName')} />
                       </Grid>
                       <Grid item xs={6}>
                          <TextField fullWidth label="Last Name" {...register('lastName')} />
                       </Grid>
                    </Grid>
                    <TextField fullWidth label="Email Address" {...register('email')} disabled helperText="Email cannot be changed" />
                    
                    <Divider />
                    
                    <Typography variant="h6">Change Password</Typography>
                    <TextField fullWidth type="password" label="New Password" placeholder="Leave blank to keep current" />
                    <TextField fullWidth type="password" label="Confirm Password" />

                    <Box display="flex" justifyContent="flex-end">
                       <LoadingButton 
                          type="submit" 
                          variant="contained" 
                          loading={isSubmitting}
                          startIcon={<SaveIcon />}
                       >
                          Save Changes
                       </LoadingButton>
                    </Box>
                 </Stack>
              </form>
           </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
