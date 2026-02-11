import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LoginPage from "./Pages/auth/Login";
import Register from "./Sections/auth/Register";
import ForgotPasswordPage from "./Pages/auth/ForgotPassword";
import SetupPassword from "./Pages/auth/SetupPassword";
import HomePage from "./Pages/HomePages";
import UserList from "./Pages/user/UserList";
import ExamList from "./Pages/exam/ExamList";
import CreateExam from "./Pages/exam/CreateExam";
import EditExam from "./Pages/exam/EditExam";
import AssignExam from "./Pages/exam/AssignExam";
import ExamDetails from "./Pages/exam/ExamDetails";
import Results from "./Pages/exam/Results";
import ClassList from "./Pages/classes/ClassList";
import Library from "./Pages/library/Library";
import Calendar from "./Pages/Calendar";
import ErrorBoundary from "./components/ErrorBoundary";
import { ROUTES } from "./constants";

import DashboardLayout from "./components/DashboardLayout";

import Profile from "./Pages/user/Profile";
import Settings from "./Pages/Settings";
import Mail from "./Pages/Mail";

import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <HelmetProvider>
        <Router>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path="/setup-password" element={<SetupPassword />} />
            
            {/* Protected Routes with Layout */}
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path="/mail" element={<Mail />} />
              <Route path="/user-list" element={<UserList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/exam-list" element={<ExamList />} />
              <Route path="/results" element={<Results />} />
              <Route path="/classes" element={<ClassList />} />
              <Route path="/library" element={<Library />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/exam/create" element={<CreateExam />} />
              <Route path="/exam/edit/:id" element={<EditExam />} />
              <Route path="/exam/:id/assign" element={<AssignExam />} />
              <Route path="/exam/:id" element={<ExamDetails />} />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </Router>
      </HelmetProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
