import React, { useContext, useState, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // adjust path if needed
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Home as HomeIcon,
  Users,
  CreditCard,
  DollarSign,
  FileText,
  LogOut
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();  // Ensure currentUser is coming from the context

  const companyName = "Credit-Bureau-Management-System";
  const systemName = "Credit-Bureau-Management-System";

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  const chartData = useMemo(() => [
    { name: 'Mon', price: 1.09 },
    { name: 'Tue', price: 1.15 },
    { name: 'Wed', price: 1.10 },
    { name: 'Thu', price: 1.12 },
    { name: 'Fri', price: 1.20 },
  ], []);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>{systemName}</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/" className="nav-link"><HomeIcon size={16} /> Dashboard</Link>
            </li>
            <li className={location.pathname === '/users' ? 'active' : ''}>
              <Link to="/users" className="nav-link"><Users size={16} /> Manage Employees</Link>
            </li>
            <li className={location.pathname === '/borrowers' ? 'active' : ''}>
              <Link to="/borrowers" className="nav-link"><Users size={16} /> Manage Borrowers</Link>
            </li>
            <li className={location.pathname === '/loans' ? 'active' : ''}>
              <Link to="/loans" className="nav-link"><CreditCard size={16} /> Manage Loans</Link>
            </li>
            <li className={location.pathname === '/repayments' ? 'active' : ''}>
              <Link to="/repayments" className="nav-link"><DollarSign size={16} /> Manage Repayments</Link>
            </li>
            <li className={location.pathname === '/creditReports' ? 'active' : ''}>
              <Link to="/creditReports" className="nav-link"><FileText size={16} /> Manage Credit Reports</Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Flag_of_Lesotho.svg" 
              alt="Lesotho Flag" 
              className="lesotho-flag"
            />
            <div className="system-info">
              <h1 className="system-title">{systemName}</h1>
              <p className="system-subtitle">Empowering Financial Transparency in Lesotho</p>
              <p className="system-date">{new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Maseru' })}</p>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              {currentUser ? (
                <>
                  <span className="username">Hello, {currentUser.username}</span>
                  <button onClick={handleLogout} className="logout-button">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <span className="username">Not logged in</span>  // If the user is not logged in
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          {location.pathname === '/' ? (
            <div className="dashboard-welcome">
              <h1>Welcome to {systemName}</h1>
              <p>Select a section from the sidebar to manage the system's functionalities</p>

              <div className="info-cards">
                <div className="info-card">
                  <h3>Employees</h3>
                  <p>Manage employee records and roles</p>
                  <Link to="/users" className="link-button">Go to Employees</Link>
                </div>
                <div className="info-card">
                  <h3>Borrowers</h3>
                  <p>View and manage borrower profiles</p>
                  <Link to="/borrowers" className="link-button">Go to Borrowers</Link>
                </div>
                <div className="info-card">
                  <h3>Loans</h3>
                  <p>Track loan applications and status</p>
                  <Link to="/loans" className="link-button">Go to Loans</Link>
                </div>
                <div className="info-card">
                  <h3>Repayments</h3>
                  <p>Monitor repayment schedules and statuses</p>
                  <Link to="/repayments" className="link-button">Go to Repayments</Link>
                </div>
                <div className="info-card">
                  <h3>Credit Reports</h3>
                  <p>Generate and manage credit reports</p>
                  <Link to="/creditReports" className="link-button">Go to Credit Reports</Link>
                </div>
              </div>

              <div className="chart-container">
                <h2>Weekly System Activity</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#22D3EE" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Home;
