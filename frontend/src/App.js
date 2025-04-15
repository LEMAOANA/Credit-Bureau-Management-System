import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Users from './components/Users';
import Borrowers from './components/Borrowers';
import Loans from './components/Loans';
import Repayments from './components/Repayments';
import CreditReports from './components/CreditReports';
import { AuthProvider } from './contexts/AuthContext';  // Correct path

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/*" element={<Home />}>
            <Route path="users" element={<Users />} />
            <Route path="borrowers" element={<Borrowers />} />
            <Route path="loans" element={<Loans />} />
            <Route path="repayments" element={<Repayments />} />
            <Route path="creditReports" element={<CreditReports />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
