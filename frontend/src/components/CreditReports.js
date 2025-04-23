import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './CreditReports.css';
import { 
  FaSearch, 
  FaDownload, 
  FaChartLine, 
  FaFilter,
  FaInfoCircle
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ScaleLoader } from 'react-spinners';
import { debounce } from 'lodash';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const CreditReports = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [creditReport, setCreditReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [chartData, setChartData] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  useEffect(() => {
    fetchBorrowers();
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/borrowers');
      if (res.data.success) {
        setBorrowers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching borrowers:', err);
      setErrorMessage('Failed to fetch borrowers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditReport = async () => {
    if (!selectedBorrower) {
      setErrorMessage('Please select a borrower first');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await axios.get(`http://localhost:5001/api/creditReports/${selectedBorrower}`);
      if (res.data.success) {
        setCreditReport(res.data.data);
        prepareChartData(res.data.data.loanDetails);
        if (res.data.data.loanDetails.length === 0) {
          setErrorMessage("This borrower has no loan history.");
        }
      }
    } catch (err) {
      console.error('Error fetching credit report:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to fetch credit report');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (loans) => {
    const data = loans.map(loan => ({
      name: loan.purpose?.length > 10 ? `${loan.purpose.substring(0, 10)}...` : loan.purpose || 'N/A',
      amount: loan.loanAmount || 0,
      repayment: loan.totalRepaymentAmount || 0,
      status: loan.status || 'unknown'
    }));
    setChartData(data);
  };

  const handleExportPDF = () => {
    if (!creditReport) return;
    
    setLoading(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(darkMode ? '#f5f5f5' : '#333');
      doc.text(`Credit Report for ${creditReport.borrowerInfo.name}`, 14, 20);
      
      // Add borrower info
      doc.setFontSize(12);
      doc.text(`Email: ${creditReport.borrowerInfo.email}`, 14, 30);
      doc.text(`Credit Score: ${creditReport.creditScore} (${getCreditScoreInfo(creditReport.creditScore).category})`, 14, 40);
      
      // Add summary cards data
      const totalLoans = creditReport.loanDetails.length;
      const activeLoans = creditReport.loanDetails.filter(l => l.status === 'active').length;
      const totalBorrowed = creditReport.loanDetails.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);
      const totalRepayment = creditReport.loanDetails.reduce((sum, loan) => sum + (loan.totalRepaymentAmount || 0), 0);
      
      doc.text('Summary:', 14, 50);
      doc.text(`Total Loans: ${totalLoans}`, 14, 60);
      doc.text(`Active Loans: ${activeLoans}`, 14, 70);
      doc.text(`Total Borrowed: ${totalBorrowed.toLocaleString()}`, 14, 80);
      doc.text(`Total Repayment: ${totalRepayment.toLocaleString()}`, 14, 90);
      
      // Add loan table
      doc.autoTable({
        startY: 100,
        head: [['Loan ID', 'Purpose', 'Status', 'Amount', 'Repayment', 'Interest Rate']],
        body: filteredReport.map(loan => [
          loan.loanId || 'N/A',
          loan.purpose || 'N/A',
          loan.status || 'Unknown',
          loan.loanAmount != null ? loan.loanAmount.toLocaleString() : 'N/A',
          loan.totalRepaymentAmount != null ? loan.totalRepaymentAmount.toLocaleString() : 'N/A',
          loan.interestRate != null ? `${loan.interestRate}%` : 'N/A'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: darkMode ? '#374151' : '#1f2937',
          textColor: darkMode ? '#f5f5f5' : '#ffffff'
        },
        alternateRowStyles: {
          fillColor: darkMode ? '#2a2a2a' : '#f9f9f9'
        }
      });
      
      // Save the PDF
      doc.save(`credit-report-${creditReport.borrowerInfo.borrowerId}-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setErrorMessage('Failed to export PDF report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!creditReport) return;
    
    setLoading(true);
    try {
      // Create CSV header
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Loan ID,Purpose,Status,Amount,Repayment,Interest Rate\n";
      
      // Add data rows
      filteredReport.forEach(loan => {
        const row = [
          `"${loan.loanId || 'N/A'}"`,
          `"${loan.purpose || 'N/A'}"`,
          `"${loan.status || 'Unknown'}"`,
          loan.loanAmount != null ? loan.loanAmount.toLocaleString() : 'N/A',
          loan.totalRepaymentAmount != null ? loan.totalRepaymentAmount.toLocaleString() : 'N/A',
          loan.interestRate != null ? `${loan.interestRate}%` : 'N/A'
        ].join(",");
        csvContent += row + "\n";
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `credit-report-${creditReport.borrowerInfo.borrowerId}-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setErrorMessage('Failed to export CSV report');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const getCreditScoreInfo = (score) => {
    if (score >= 800) return { category: 'Excellent', color: '#2e7d32' };
    if (score >= 740) return { category: 'Very Good', color: '#689f38' };
    if (score >= 670) return { category: 'Good', color: '#fbc02d' };
    if (score >= 580) return { category: 'Fair', color: '#ff9800' };
    return { category: 'Poor', color: '#d32f2f' };
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const filteredReport = creditReport ? 
    creditReport.loanDetails.filter(loan => {
      const matchesSearch = loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || loan.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    }) : [];

  return (
    <div className={`credit-reports-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header-section">
        <h2>Credit Report Management</h2>
        <div className="header-controls">
          <button onClick={toggleDarkMode} className="mode-toggle" aria-label="Toggle dark mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setShowHelp(!showHelp)} className="help-btn" aria-label="Help">
            <FaInfoCircle />
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="help-section">
          <h3>Credit Report Help</h3>
          <p>1. Select a borrower from the dropdown to view their credit report.</p>
          <p>2. Use the search box to filter loans by purpose or ID.</p>
          <p>3. Filter loans by status using the status dropdown.</p>
          <p>4. Export reports in PDF or CSV format using the export buttons.</p>
          <p>5. View loan data visualization in the interactive chart.</p>
        </div>
      )}

      <div className="controls">
        <div className="borrower-select">
          <label htmlFor="borrower">Select Borrower:</label>
          <select
            id="borrower"
            value={selectedBorrower}
            onChange={(e) => setSelectedBorrower(e.target.value)}
            disabled={loading}
          >
            <option value="">Choose a Borrower</option>
            {borrowers.map(borrower => (
              <option key={borrower._id} value={borrower._id}>
                {borrower.name} ({borrower.email})
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={fetchCreditReport} 
          disabled={!selectedBorrower || loading}
          className="fetch-btn"
        >
          {loading ? 'Loading...' : 'Fetch Credit Report'}
        </button>
      </div>

      <div className="filter-controls">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search loans..."
            onChange={handleSearchChange}
            disabled={!creditReport}
          />
        </div>

        <div className="status-filter">
          <label htmlFor="status-filter"><FaFilter /> Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={!creditReport}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="defaulted">Defaulted</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {loading && !creditReport && (
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-chart"></div>
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
        </div>
      )}

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {creditReport && (
        <div className="report-details">
          <div className="report-header">
            <div>
              <h3>Credit Report for {creditReport.borrowerInfo.name}</h3>
              <p className="borrower-email">{creditReport.borrowerInfo.email}</p>
            </div>
            <div className="credit-score-display">
              <span>Credit Score: </span>
              <span 
                className="credit-score" 
                style={{ color: getCreditScoreInfo(creditReport.creditScore).color }}
              >
                {creditReport.creditScore} ({getCreditScoreInfo(creditReport.creditScore).category})
              </span>
            </div>
          </div>

          <div className="chart-container">
            <h4>Loan Amount vs Repayment</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Loan Amount" />
                <Bar dataKey="repayment" fill="#82ca9d" name="Total Repayment" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <h5>Total Loans</h5>
              <p>{creditReport.loanDetails.length}</p>
            </div>
            <div className="summary-card">
              <h5>Active Loans</h5>
              <p>{creditReport.loanDetails.filter(l => l.status === 'active').length}</p>
            </div>
            <div className="summary-card">
              <h5>Total Borrowed</h5>
              <p>{creditReport.loanDetails.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h5>Total Repayment</h5>
              <p>{creditReport.loanDetails.reduce((sum, loan) => sum + (loan.totalRepaymentAmount || 0), 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Repayment</th>
                  <th>Interest Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredReport.length > 0 ? (
                  filteredReport.map(loan => (
                    <tr key={loan.loanId || Math.random()} className={`status-${loan.status?.toLowerCase() || 'unknown'}`}>
                      <td>{loan.loanId || 'N/A'}</td>
                      <td>{loan.purpose || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${loan.status?.toLowerCase() || 'unknown'}`}>
                          {loan.status || 'Unknown'}
                        </span>
                      </td>
                      <td>{loan.loanAmount != null ? loan.loanAmount.toLocaleString() : 'N/A'}</td>
                      <td>{loan.totalRepaymentAmount != null ? loan.totalRepaymentAmount.toLocaleString() : 'N/A'}</td>
                      <td>{loan.interestRate != null ? `${loan.interestRate}%` : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No loans match your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="action-buttons">
            <button onClick={handleExportPDF} className="export-btn pdf">
              <FaDownload /> Export to PDF
            </button>
            <button onClick={handleExportCSV} className="export-btn csv">
              <FaDownload /> Export to CSV
            </button>
            <button className="export-btn chart" disabled>
              <FaChartLine /> Export Chart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditReports;