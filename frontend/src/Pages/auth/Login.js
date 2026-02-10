import { Helmet } from 'react-helmet-async';
import Login from '../../Sections/auth/Login';

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
