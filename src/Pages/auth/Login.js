import { Helmet } from 'react-helmet-async';
import Login from '../../Sections/auth/Login';
import { Box } from '@mui/material';
// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Login </title>
      </Helmet>

      <Box sx={{width: '100%'}}>
        <Login />
      </Box>
    </>
  );
}
