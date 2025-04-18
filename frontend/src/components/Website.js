import React, { useState } from 'react';
import './Website.css';

const Website = () => {
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState(2000);
  const [savingsGoal, setSavingsGoal] = useState(10000);
  const [monthlySavings, setMonthlySavings] = useState(0);

  const calculateSavings = () => {
    setMonthlySavings(savingsGoal / (12 - (expenses / income) * 12));
  };

  return (
    <div className="finance-app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">Personal Finance Tracker</h1>
          <nav className="main-nav">
            <a href="#calculator" className="nav-link">Budget Calculator</a>
            <a href="#about" className="nav-link">About</a>
          </nav>
        </div>
      </header>

      <section className="hero-banner">
        <div className="hero-content">
          <h2 className="hero-title">Take Control of Your Finances</h2>
          <p className="hero-text">Track your income, expenses, and savings goals to build a stable financial future.</p>
          <a href="#calculator" className="cta-button">Start Calculating</a>
        </div>
      </section>

      <main className="app-main">
        <section id="calculator" className="calculator-section">
          <div className="section-container">
            <h2 className="section-title">Budget Calculator</h2>
            <div className="calculator-grid">
              <div className="calculator-controls">
                <div className="input-group">
                  <label className="input-label">Monthly Income (LSL)</label>
                  <input
                    type="number"
                    value={income}
                    onChange={e => setIncome(Number(e.target.value))}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Monthly Expenses (LSL)</label>
                  <input
                    type="number"
                    value={expenses}
                    onChange={e => setExpenses(Number(e.target.value))}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Savings Goal (LSL)</label>
                  <input
                    type="number"
                    value={savingsGoal}
                    onChange={e => setSavingsGoal(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="calculator-results">
                <h3 className="results-title">Recommended Monthly Savings</h3>
                <div className="payment-amount">LSL {monthlySavings.toFixed(2)}</div>
                <button onClick={calculateSavings} className="cta-button full-width">Calculate Savings</button>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="section-container">
            <h2 className="section-title">About Us</h2>
            <p className="about-text">We provide tools for individuals to track their finances and help them reach their savings goals faster.</p>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
            <a href="/terms-of-service" className="footer-link">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Website;
