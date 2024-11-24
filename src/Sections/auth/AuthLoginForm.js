import { useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Icon } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function AuthLoginForm() {

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    if (!emailId || !password) {
      setMessage('Please enter both email and password.');
      return;
    }
    setLoading(true);
  
    axios
      // .post('http://localhost:5000/api/user', 
      //   JSON.stringify({
      //     "httpMethod": "POST",
      //     "body": JSON.stringify({"user_email": emailId, "user_password": password})
      //   })
      // )
      .post('http://localhost:5000/api/user', { user_email: emailId, user_password: password })
      .then((response) => {
        console.log('Response:', response);
        // if (response.data === 200) {
        // if (response.data.statusCode === 200) {
          const responseData = response.data; 
          setMessage('Login Successful');
          setLoading(false);
          const { user_role, user_id, institude_id } = responseData;
          // navigate('Home', { user_email: emailId, user_id: user_id, institude_id: institude_id, user_role: user_role });
          navigate('/home', { user_email: emailId, user_id: user_id, institude_id: institude_id, user_role: user_role })
        // } else {
        //   setMessage('Invalid email & password');
        //   setLoading(false);
        // }
      })      
      .catch((error) => {
        console.error('Error:', error.message);
        setMessage(`Error: ${error.message}, Please try again later.`);        
        setLoading(false);
      });
    };

  return (
    <FormProvider>
      <Stack spacing={3}>

      <TextField
          name="email"
          onChange={(e) => setEmailId(e.target.value)}
          inputRef={emailInputRef}
          variant="outlined"
          value={emailId}
          autoFocus
          placeholder="Username"
          sx={{ backgroundColor: '#EEFCFC ', borderRadius: '8px' }}
        />

        <TextField
          name="password"
          placeholder="Password"
          inputRef={passwordInputRef}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ backgroundColor: '#EEFCFC ', borderRadius: '8px' }}
          endAdornment={ (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Icon>{showPassword ? 'visibility' : 'visibility_off'}</Icon>
                </IconButton>
              </InputAdornment>
            )}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ color: 'black' }} spacing={2}>
        <Link variant="subtitle2" sx={{ color: 'black' }} >
          Forgot password?
        </Link>
      </Stack>

      <Stack direction="column" alignItems="center" justifyContent="space-between" spacing={3}>
        <LoadingButton fullWidth onClick={handleLogin} size="large" type="submit" variant="contained" 
          sx={{
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            },
            backgroundColor: 'green'
          }}>
          Login
        </LoadingButton>
        <LoadingButton fullWidth onClick={()=>navigate('/register')} size="large" type="submit" variant="contained" 
          sx={{
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            },
            backgroundColor: 'green'
          }} >
          Register
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
