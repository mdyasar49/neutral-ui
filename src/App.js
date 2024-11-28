<<<<<<< HEAD
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
=======
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
>>>>>>> 1986401fd9a114f84d0e2c4eacc5704a09747920
