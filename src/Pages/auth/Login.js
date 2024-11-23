import { Helmet } from 'react-helmet-async';
import Login from '../../Sections/auth/Login';
import { Box, Container } from '@mui/material';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Login </title>
      </Helmet>

      <Login />
    </>
  );
}
