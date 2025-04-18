import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate here
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Admin from './components/Admin';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Landers from './components/Landers';
import Borrowers from './components/Borrowers';
import Loans from './components/Loans';
import Website from './components/Website';
import Repayments from './components/Repayments';
import CreditReports from './components/CreditReports';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Website />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Admin Routes */}
          <Route path="/Admin" element={<PrivateRoute />}>
            <Route element={<Admin />}>
              <Route index element={<Dashboard />} />
              <Route path="landers" element={<Landers />} />
              <Route path="borrowers" element={<Borrowers />} />
              <Route path="loans" element={<Loans />} />
              <Route path="repayments" element={<Repayments />} />
              <Route path="creditReports" element={<CreditReports />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;