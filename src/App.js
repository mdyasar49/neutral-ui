import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LoginPage from "./Pages/auth/Login";
import Register from "./Sections/auth/Register";
import HomePage from "./Pages/HomePages";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />}/>
          <Route path="/login" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
