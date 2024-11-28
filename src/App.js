import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Lazy loading components
const LoginPage = lazy(() => import("./Pages/auth/Login"));
const Register = lazy(() => import("./Sections/auth/Register"));
const HomePage = lazy(() => import("./Pages/HomePages"));

function App() {
  return (
    <HelmetProvider>
      <Router>
        {/* Suspense provides a fallback while the component is being loaded */}
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;
