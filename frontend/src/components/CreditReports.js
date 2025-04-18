import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CreditReports.css';
import { FaSearch, FaFileAlt, FaUser, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

const CreditReports = () => {
  const [creditReports, setCreditReports] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateFormData, setGenerateFormData] = useState({ borrower: '', loan: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reports, borrowersData, loansData] = await Promise.all([
        axios.get('http://localhost:5001/api/credit-reports'),
        axios.get('http://localhost:5001/api/borrowers'),
        axios.get('http://localhost:5001/api/loans')
      ]);
      if (reports.data.success) setCreditReports(reports.data.data);
      if (borrowersData.data.success) setBorrowers(borrowersData.data.data);
      if (loansData.data.success) setLoans(loansData.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCreditReport = async (e) => {
    e.preventDefault();
    try {
      const { borrower, loan } = generateFormData;
      const res = await axios.post('http://localhost:5001/api/credit-reports/generate', { borrowerId: borrower, loanId: loan });
      if (res.data.success) {
        setCreditReports([res.data.data, ...creditReports]);
        setShowGenerateForm(false);
        setGenerateFormData({ borrower: '', loan: '' });
        alert('Credit report generated successfully!');
      }
    } catch (err) {
      console.error('Error generating credit report:', err);
      alert(`Error generating credit report: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGenerateFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredReports = creditReports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.borrower?.name?.toLowerCase().includes(searchLower) ||
      report.loan?.purpose?.toLowerCase().includes(searchLower) ||
      report.creditScore.toString().includes(searchTerm) ||
      report.outstandingBalance.toString().includes(searchTerm) ||
      report.totalRepaymentsMade.toString().includes(searchTerm)
    );
  });

  if (loading) return <p className="loading">Loading credit reports...</p>;

  return (
    <div className="credit-reports-container">
      <h2>Credit Report Management</h2>

      <div className="controls">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search credit reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          className="generate-report-btn"
          onClick={() => setShowGenerateForm(!showGenerateForm)}
        >
          <FaChartLine /> Generate New Report
        </button>
      </div>

      {/* Generate Report Form */}
      {showGenerateForm && (
        <form onSubmit={generateCreditReport} className="generate-form">
          <h3>Generate Credit Report</h3>
          <select
            name="borrower"
            value={generateFormData.borrower}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Borrower</option>
            {borrowers.map(borrower => (
              <option key={borrower._id} value={borrower._id}>
                {borrower.name} ({borrower.email})
              </option>
            ))}
          </select>

          <select
            name="loan"
            value={generateFormData.loan}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Loan</option>
            {loans
              .filter(loan => loan.borrower._id === generateFormData.borrower)
              .map(loan => (
                <option key={loan._id} value={loan._id}>
                  ${loan.amount} - {loan.purpose} ({loan.status})
                </option>
              ))}
          </select>

          <button type="submit">Generate Report</button>
          <button 
            type="button" 
            onClick={() => setShowGenerateForm(false)}
            className="cancel-btn"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Credit Reports Table */}
      {filteredReports.length === 0 ? (
        <p className="no-results">No credit reports found{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
      ) : (
        <div className="reports-list">
          <table className="credit-reports-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Loan</th>
                <th>Credit Score</th>
                <th>Repayments</th>
                <th>Outstanding</th>
                <th>Generated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr 
                  key={report._id} 
                  className={selectedReport?._id === report._id ? 'selected' : ''}
                  onClick={() => setSelectedReport(selectedReport?._id === report._id ? null : report)}
                >
                  <td>
                    {report.borrower?.name || 'Unknown Borrower'}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("This would navigate to the borrower details page");
                      }}
                      className="icon-button"
                    >
                      <FaUser title="View Borrower" />
                    </button>
                  </td>
                  <td>
                    {report.loan?.purpose || 'Unknown Loan'}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("This would navigate to the loan details page");
                      }}
                      className="icon-button"
                    >
                      <FaMoneyBillWave title="View Loan" />
                    </button>
                  </td>
                  <td className={`credit-score ${getScoreClass(report.creditScore)}`}>
                    {report.creditScore}
                  </td>
                  <td>${report.totalRepaymentsMade?.toLocaleString()}</td>
                  <td>${report.outstandingBalance?.toLocaleString()}</td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}
                      className="view-details-btn"
                    >
                      <FaFileAlt /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Report Details Panel */}
          {selectedReport && (
            <div className="report-details">
              <div className="details-header">
                <h3>Credit Report Details</h3>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Borrower:</label>
                  <span>{selectedReport.borrower?.name || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <label>Loan:</label>
                  <span>{selectedReport.loan?.purpose || 'Unknown'} (${selectedReport.loan?.amount})</span>
                </div>
                <div className="detail-item">
                  <label>Credit Score:</label>
                  <span className={`score ${getScoreClass(selectedReport.creditScore)}`}>
                    {selectedReport.creditScore}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Total Repayments:</label>
                  <span>${selectedReport.totalRepaymentsMade?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Outstanding Balance:</label>
                  <span>${selectedReport.outstandingBalance?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Report Generated:</label>
                  <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="repayment-history">
                <h4>Repayment History</h4>
                {selectedReport.repaymentHistory?.length > 0 ? (
                  <ul>
                    {selectedReport.repaymentHistory.map(repayment => (
                      <li key={repayment._id}>
                        <span className="amount">${repayment.paymentAmount}</span>
                        <span className="date">{new Date(repayment.paymentDate).toLocaleDateString()}</span>
                        <span className="type">{repayment.paymentType}</span>
                        <button 
                          onClick={() => alert("This would navigate to the repayment details page")}
                          className="view-btn"
                        >
                          <FaFileAlt />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No repayment history available</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to determine credit score class
function getScoreClass(score) {
  if (score >= 750) return 'excellent';
  if (score >= 650) return 'good';
  if (score >= 550) return 'fair';
  return 'poor';
}

export default CreditReports;
