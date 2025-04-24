import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import autoTable from 'jspdf-autotable';

const formatCurrency = (amount) => {
  const num = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^\d.-]/g, '')) 
    : Number(amount);
  
  if (isNaN(num)) {
    console.warn('Invalid amount:', amount);
    return 'N/A';
  }
  
  return `M${num.toLocaleString('en-LS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

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
  const chartRef = useRef(null);

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
        const normalizedLoans = res.data.data.loanDetails.map(loan => ({
          ...loan,
          loanAmount: loan.loanAmount ?? loan.amount ?? 0,
          totalRepaymentAmount: loan.totalRepaymentAmount ?? loan.repayment ?? 0
        }));
        
        setCreditReport({
          ...res.data.data,
          loanDetails: normalizedLoans,
          repaymentHistory: res.data.data.repaymentHistory || []
        });
        prepareChartData(normalizedLoans);
        
        if (normalizedLoans.length === 0) {
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
      amount: Number(loan.loanAmount) || 0,
      repayment: Number(loan.totalRepaymentAmount) || 0,
      status: loan.status || 'unknown'
    }));
    setChartData(data);
  };

  const handleExportPDF = () => {
    if (!creditReport || filteredReport.length === 0) {
      setErrorMessage('No data available to export');
      return;
    }
    
    setLoading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm'
      });

      // Header
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text('CREDIT REPORT', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Prepared for ${creditReport.borrowerInfo.name}`, 105, 20, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });

      // Borrower Information
      doc.setFontSize(14);
      doc.text('Borrower Information', 20, 35);
      doc.setFontSize(12);
      doc.text(`Name: ${creditReport.borrowerInfo.name}`, 20, 40);
      doc.text(`Email: ${creditReport.borrowerInfo.email}`, 20, 45);
      doc.text(`Phone: ${creditReport.borrowerInfo.phone || 'N/A'}`, 20, 50);
      doc.text(`Borrower ID: ${creditReport.borrowerInfo.borrowerId || 'N/A'}`, 20, 55);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 60);

      // Credit Summary
      doc.setFontSize(14);
      doc.text('Credit Summary', 20, 70);
      
      const totalLoans = creditReport.loanDetails.length;
      const totalBorrowed = creditReport.loanDetails.reduce((sum, loan) => sum + (Number(loan.loanAmount) || 0), 0);
      const totalRepayment = creditReport.loanDetails.reduce((sum, loan) => sum + (Number(loan.totalRepaymentAmount) || 0), 0);
      const totalOutstanding = totalBorrowed - totalRepayment;

      // Summary table
      autoTable(doc, {
        startY: 75,
        head: [['Metric', 'Value']],
        body: [
          ['Credit Score:', creditReport.creditScore || 'N/A'],
          ['Total Loans:', totalLoans],
          ['Total Borrowed:', formatCurrency(totalBorrowed)],
          ['Total Repaid:', formatCurrency(totalRepayment)],
          ['Total Outstanding:', totalOutstanding > 0 ? formatCurrency(totalOutstanding) : 'N/A'],
          ['Last Activity:', 'N/A']
        ],
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: 255,
          fontSize: 10,
          halign: 'center'
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' }
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        margin: { top: 75 }
      });

      // Loan Details
      doc.setFontSize(14);
      doc.text('Loan Details', 20, doc.lastAutoTable.finalY + 10);

      const loanDetailsData = creditReport.loanDetails.map(loan => [
        loan.loanId || 'N/A',
        formatCurrency(loan.loanAmount || 0),
        loan.interestRate != null ? `${loan.interestRate}%` : 'N/A',
        loan.purpose || 'N/A',
        loan.status || 'Unknown',
        loan.status || 'Not Started',
        formatCurrency(loan.totalRepaymentAmount || 0)
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Loan ID', 'Amount', 'Rate', 'Purpose', 'Status', 'Progress', 'Total Repayment']],
        body: loanDetailsData,
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: 255,
          fontSize: 10,
          halign: 'center'
        },
        columnStyles: {
          1: { halign: 'right' },
          6: { halign: 'right' }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak'
        }
      });

      // Repayment History
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Repayment History', 20, 20);

      const repaymentData = creditReport.repaymentHistory.map(payment => [
        formatDate(payment.date),
        formatCurrency(payment.amount || 0),
        payment.method || 'N/A',
        payment.notes || 'N/A'
      ]);

      autoTable(doc, {
        startY: 25,
        head: [['Date', 'Amount', 'Method', 'Notes']],
        body: repaymentData,
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: 255,
          fontSize: 10,
          halign: 'center'
        },
        columnStyles: {
          1: { halign: 'right' }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        }
      });

      // Credit Analysis
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Credit Analysis', 20, 20);
      doc.setFontSize(12);
      
      const analysisText = [
        'This credit report provides a comprehensive overview of the borrower\'s financial activity with our institution. Key observations:',
        '',
        `- The borrower currently has ${totalOutstanding > 0 ? 'an outstanding balance' : 'no outstanding balance'}`,
        `- Their credit score of ${creditReport.creditScore || 'N/A'} is ${getCreditScoreInfo(creditReport.creditScore).category.toLowerCase()}`,
        `- ${creditReport.repaymentHistory?.length || 0} recorded payments have been made`,
        '',
        'This concludes the summary of the borrower\'s financial activities.'
      ];
      
      let yPosition = 30;
      analysisText.forEach((line) => {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Confidential - Generated on ${new Date().toLocaleString()}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );

      doc.save(`credit-report-${creditReport.borrowerInfo.borrowerId}-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      setErrorMessage('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!creditReport) return;
    
    setLoading(true);
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Loan ID,Purpose,Status,Amount (M),Repayment (M),Interest Rate,Remaining (M)\n";
      
      filteredReport.forEach(loan => {
        const amount = Number(loan.loanAmount) || 0;
        const repayment = Number(loan.totalRepaymentAmount) || 0;
        const remaining = amount - repayment;
        
        const row = [
          `"${loan.loanId || 'N/A'}"`,
          `"${loan.purpose || 'N/A'}"`,
          `"${loan.status || 'Unknown'}"`,
          formatCurrency(amount),
          formatCurrency(repayment),
          loan.interestRate != null ? `${loan.interestRate}%` : 'N/A',
          remaining >= 0 ? formatCurrency(remaining) : 'Paid'
        ].join(",");
        csvContent += row + "\n";
      });
      
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

  const handleExportChart = () => {
    if (!creditReport) return;
    
    try {
      const canvas = document.createElement('canvas');
      const svg = chartRef.current?.querySelector('svg');
      
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const dataURL = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataURL;
          link.download = `credit-chart-${creditReport.borrowerInfo.borrowerId}-${new Date().toISOString().slice(0,10)}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }
    } catch (err) {
      console.error('Error exporting chart:', err);
      setErrorMessage('Failed to export chart');
    }
  };

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const getCreditScoreInfo = (score) => {
    if (score >= 800) return { category: 'Excellent', color: '#10b981' };
    if (score >= 740) return { category: 'Very Good', color: '#34d399' };
    if (score >= 670) return { category: 'Good', color: '#fbbf24' };
    if (score >= 580) return { category: 'Fair', color: '#f97316' };
    return { category: 'Poor', color: '#ef4444' };
  };

  const filteredReport = creditReport ? 
    creditReport.loanDetails.filter(loan => {
      const matchesSearch = loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || loan.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    }) : [];

  return (
    <div className="credit-reports-container">
      <div className="header-section">
        <h2>Credit Report Management</h2>
        <button onClick={() => setShowHelp(!showHelp)} className="help-btn" aria-label="Help">
          <FaInfoCircle />
        </button>
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
            <ResponsiveContainer width="100%" height={300} ref={chartRef}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis 
                  stroke="#9ca3af" 
                  tickFormatter={(value) => `M${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), value === chartData[0]?.amount ? 'Loan Amount' : 'Total Repayment']}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderColor: '#4b5563',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Loan Amount (M)" />
                <Bar dataKey="repayment" fill="#82ca9d" name="Total Repayment (M)" />
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
              <p>{formatCurrency(creditReport.loanDetails.reduce((sum, loan) => sum + (Number(loan.loanAmount) || 0), 0))}</p>
            </div>
            <div className="summary-card">
              <h5>Total Repayment</h5>
              <p>{formatCurrency(creditReport.loanDetails.reduce((sum, loan) => sum + (Number(loan.totalRepaymentAmount) || 0), 0))}</p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Amount (M)</th>
                  <th>Repayment (M)</th>
                  <th>Interest Rate</th>
                  <th>Remaining (M)</th>
                </tr>
              </thead>
              <tbody>
                {filteredReport.length > 0 ? (
                  filteredReport.map(loan => {
                    const amount = Number(loan.loanAmount) || 0;
                    const repayment = Number(loan.totalRepaymentAmount) || 0;
                    const remaining = amount - repayment;
                    
                    return (
                      <tr key={loan.loanId || Math.random()} className={`status-${loan.status?.toLowerCase() || 'unknown'}`}>
                        <td>{loan.loanId || 'N/A'}</td>
                        <td>{loan.purpose || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${loan.status?.toLowerCase() || 'unknown'}`}>
                            {loan.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="amount-cell">{formatCurrency(amount)}</td>
                        <td className="amount-cell">{formatCurrency(repayment)}</td>
                        <td>{loan.interestRate != null ? `${loan.interestRate}%` : 'N/A'}</td>
                        <td className={`amount-cell ${remaining > 0 ? 'remaining-red' : 'remaining-green'}`}>
                          {remaining >= 0 ? formatCurrency(remaining) : 'Paid'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="no-results">
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
            <button onClick={handleExportChart} className="export-btn chart">
              <FaChartLine /> Export Chart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditReports;