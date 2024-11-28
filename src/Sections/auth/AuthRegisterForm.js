import { useState } from 'react';
import { Stack, IconButton, InputAdornment, TextField, Icon } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FormProvider } from 'react-hook-form';

// ----------------------------------------------------------------------

export default function AuthRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormProvider>
      <Stack spacing={2.5}>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={6}>
          <TextField name="firstName" label="First name" fullWidth  sx={{ backgroundColor: '#EEFCFC ',borderRadius: '8px' }} />
          <TextField name="lastName" label="Last name" fullWidth sx={{ backgroundColor: '#EEFCFC ',borderRadius: '8px' }} />
        </Stack>

        <TextField name="email" label="Email address"  sx={{ backgroundColor: '#EEFCFC ',borderRadius: '8px' }}/>
 
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          sx={{ backgroundColor: '#EEFCFC ',borderRadius: '8px' }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Icon icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
              </IconButton>
            </InputAdornment>
          }
        />

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          sx={{
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            },
            backgroundColor: '#D88212'
          }}
        >
          Create account
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
