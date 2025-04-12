// src/components/Home.js
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Home.css';

const Home = () => {
  const location = useLocation();

  // Static user and company info — replace with dynamic data from auth/context
  const currentUser = "Admin User";
  const companyName = "Credit-Bureau-Management-System";
  const systemName = "Credit-Bureau-Management-System";

  // Helper function to check active links
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>{systemName}</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={isActive('/') ? 'active' : ''}>
              <Link to="/" className="nav-link">
                <i className="fas fa-home"></i> Main
              </Link>
            </li>
            <li className={isActive('/users') ? 'active' : ''}>
              <Link to="/users" className="nav-link">
                <i className="fas fa-users"></i> Employees
              </Link>
            </li>
            <li className={isActive('/borrowers') ? 'active' : ''}>
              <Link to="/borrowers" className="nav-link">
                <i className="fas fa-user-tie"></i> Borrowers
              </Link>
            </li>
            <li className={isActive('/loans') ? 'active' : ''}>
              <Link to="/loans" className="nav-link">
                <i className="fas fa-file-invoice-dollar"></i> Loans
              </Link>
            </li>
            <li className={isActive('/repayments') ? 'active' : ''}>
              <Link to="/repayments" className="nav-link">
                <i className="fas fa-file-invoice-repayments"></i> Repayments
              </Link>
            </li>
            <li className={isActive('/creditReports') ? 'active' : ''}>
              <Link to="/creditReports" className="nav-link">
                <i className="fas fa-file-invoice-reports"></i> CreditReports
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <h3>{companyName}</h3>
            <p className="header-description">Welcome to the admin dashboard for managing the Credit Bureau System.</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="username">{currentUser}</span>
              <div className="user-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          {location.pathname === '/' ? (
            <div className="dashboard-welcome">
              <h1>Welcome to {systemName}</h1>
              <p>Select a section from the sidebar to begin</p>

              {/* Forex Ticker */}
              <div className="forex-ticker">
                {['EUR/USD 1.1098 ↑', 'GBP/USD 1.3032 ↓', 'USD/JPY 138.45 ↑', 'BTC/USD $27,300 ↑'].map((rate, i) => (
                  <span key={i} className="ticker-item">{rate}</span>
                ))}
              </div>

              {/* Key Metrics */}
              <div className="info-cards">
                {[ 
                  { title: 'Active Investments', value: '1,245' }, 
                  { title: 'Total Loan Volume', value: '$4.2M' },
                  { title: 'Market Volatility', value: 'High' },
                  { title: 'Current Reports', value: '587' },
                ].map((item, idx) => (
                  <div key={idx} className="info-card">
                    <h3>{item.title}</h3>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Market Trends - Chart */}
              <div className="chart-container">
                <h2>Weekly EUR/USD Forecast</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[ 
                    { name: 'Mon', price: 1.09 },
                    { name: 'Tue', price: 1.15 },
                    { name: 'Wed', price: 1.10 },
                    { name: 'Thu', price: 1.12 },
                    { name: 'Fri', price: 1.20 },
                  ]}>
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
