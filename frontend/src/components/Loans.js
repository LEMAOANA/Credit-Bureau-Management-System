import React, { useEffect, useState, useMemo, useRef } from 'react';
import { FaPrint } from 'react-icons/fa';
import axios from 'axios';
import './Loans.css';
import { 
  FaPlus, FaEdit, FaTrash, FaUser, FaSearch, 
  FaFilter, FaFileExport, FaCalendarAlt 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO, subDays } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

const Loans = () => {
  // State management
  const [loans, setLoans] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLoan, setNewLoan] = useState(initialFormState());
  const [editingLoan, setEditingLoan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    repaymentStatus: '',
    dateRange: 'all',
    minAmount: '',
    maxAmount: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const loansTableRef = useRef();

  // Constants
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Defaulted'];
  const repaymentStatusOptions = ['Not Started', 'In Progress', 'Completed', 'Delayed'];
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 90 Days' },
    { value: 'year', label: 'Last Year' }
  ];

  // Initialize toast notifications
  const notify = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Initial form state
  function initialFormState() {
    return {
      borrower: '',
      amount: '',
      purpose: '',
      status: 'Pending',
      repaymentStatus: 'Not Started',
      interestRate: '',
      loanTerm: '',
      repaymentStartDate: '',
      collateral: '',
      notes: ''
    };
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Data fetching function
  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, borrowersRes] = await Promise.all([
        axios.get('http://localhost:5001/api/loans'),
        axios.get('http://localhost:5001/api/borrowers')
      ]);

      if (loansRes.data) {
        const sortedLoans = Array.isArray(loansRes.data) 
          ? loansRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setLoans(sortedLoans);
      }

      if (borrowersRes.data?.success) {
        setBorrowers(borrowersRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      notify('Failed to load data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort loans
  const filteredLoans = useMemo(() => {
    let result = [...loans];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(loan => 
        (loan.borrower?.name?.toLowerCase().includes(term)) ||
        (loan.purpose?.toLowerCase().includes(term)) ||
        (loan.amount?.toString().includes(term)) ||
        (loan.status?.toLowerCase().includes(term)) ||
        (loan.repaymentStatus?.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(loan => loan.status === filters.status);
    }
    
    // Apply repayment status filter
    if (filters.repaymentStatus) {
      result = result.filter(loan => loan.repaymentStatus === filters.repaymentStatus);
    }
    
    // Apply amount range filter
    if (filters.minAmount) {
      result = result.filter(loan => loan.amount >= Number(filters.minAmount));
    }
    if (filters.maxAmount) {
      result = result.filter(loan => loan.amount <= Number(filters.maxAmount));
    }
    
    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate = subDays(now, 1);
          break;
        case 'week':
          cutoffDate = subDays(now, 7);
          break;
        case 'month':
          cutoffDate = subDays(now, 30);
          break;
        case 'quarter':
          cutoffDate = subDays(now, 90);
          break;
        case 'year':
          cutoffDate = subDays(now, 365);
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate) {
        result = result.filter(loan => new Date(loan.createdAt) >= cutoffDate);
      }
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [loans, searchTerm, filters, sortConfig]);

  // Pagination logic
  const indexOfLastLoan = currentPage * usersPerPage;
  const indexOfFirstLoan = indexOfLastLoan - usersPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan);
  const totalPages = Math.ceil(filteredLoans.length / usersPerPage);

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle form changes
  const handleChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e, setter) => {
    const { name, value } = e.target;
    if (value === '' || !isNaN(value)) {
      setter(prev => ({ ...prev, [name]: value }));
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingLoan) {
        await updateLoan();
      } else {
        await addLoan();
      }
      setCurrentPage(1); // Reset to first page after adding/editing
    } catch (error) {
      console.error('Error submitting loan:', error);
      notify(error?.response?.data?.message || 'Operation failed. Please try again.', 'error');
    }
  };

  // Add new loan
  const addLoan = async () => {
    const payload = {
      borrower: newLoan.borrower,
      amount: Number(newLoan.amount),
      purpose: newLoan.purpose,
      interestRate: Number(newLoan.interestRate),
      loanTerm: Number(newLoan.loanTerm),
      repaymentStartDate: newLoan.repaymentStartDate,
      status: newLoan.status,
      repaymentStatus: newLoan.repaymentStatus,
      collateral: newLoan.collateral,
      notes: newLoan.notes
    };

    const response = await axios.post('http://localhost:5001/api/loans', payload);
    setLoans([response.data, ...loans]);
    resetForm();
    notify('Loan added successfully!');
  };

  // Update existing loan
  const updateLoan = async () => {
    const payload = {
      borrower: editingLoan.borrower,
      amount: Number(editingLoan.amount),
      purpose: editingLoan.purpose,
      interestRate: Number(editingLoan.interestRate),
      loanTerm: Number(editingLoan.loanTerm),
      repaymentStartDate: editingLoan.repaymentStartDate,
      status: editingLoan.status,
      repaymentStatus: editingLoan.repaymentStatus,
      collateral: editingLoan.collateral,
      notes: editingLoan.notes
    };

    const response = await axios.put(
      `http://localhost:5001/api/loans/${editingLoan._id}`,
      payload
    );
    
    setLoans(loans.map(loan => 
      loan._id === editingLoan._id ? response.data : loan
    ));
    resetForm();
    notify('Loan updated successfully!');
  };

  // Reset form
  const resetForm = () => {
    setNewLoan(initialFormState());
    setEditingLoan(null);
    setShowForm(false);
  };

  // Delete loan
  const deleteLoan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan? This action cannot be undone.')) return;

    try {
      await axios.delete(`http://localhost:5001/api/loans/${id}`);
      setLoans(loans.filter(loan => loan._id !== id));
      notify('Loan deleted successfully');
    } catch (error) {
      console.error('Error deleting loan:', error);
      notify('Error deleting loan', 'error');
    }
  };

  // View borrower details
  const viewBorrower = (borrower) => {
    const details = `
      Borrower Details:
      Name: ${borrower.name}
      Email: ${borrower.email}
      Phone: ${borrower.phone || 'N/A'}
      ID Number: ${borrower.idNumber || 'N/A'}
      Address: ${borrower.address || 'N/A'}
    `;
    alert(details);
  };

  // Calculate loan statistics
  const loanStats = useMemo(() => {
    const stats = {
      totalLoans: filteredLoans.length,
      totalAmount: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      defaulted: 0
    };

    filteredLoans.forEach(loan => {
      stats.totalAmount += loan.amount || 0;
      if (loan.status === 'Approved') stats.approved++;
      if (loan.status === 'Pending') stats.pending++;
      if (loan.status === 'Rejected') stats.rejected++;
      if (loan.status === 'Defaulted') stats.defaulted++;
    });

    return stats;
  }, [filteredLoans]);

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => loansTableRef.current,
    pageStyle: `
      @page { size: auto; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #3498db !important; color: white !important; }
        .no-print { display: none !important; }
        .pagination { display: none !important; }
      }
    `,
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Borrower', 'Amount', 'Purpose', 'Interest Rate', 'Loan Term', 
      'Status', 'Repayment Status', 'Created Date', 'Repayment Start Date'
    ];
    
    const data = filteredLoans.map(loan => [
      loan.borrower?.name || 'Unknown',
      loan.amount,
      loan.purpose,
      `${loan.interestRate}%`,
      `${loan.loanTerm} months`,
      loan.status,
      loan.repaymentStatus,
      format(parseISO(loan.createdAt), 'yyyy-MM-dd'),
      loan.repaymentStartDate ? format(parseISO(loan.repaymentStartDate), 'yyyy-MM-dd') : 'N/A'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + data.map(row => row.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `loans_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) resetForm();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      repaymentStatus: '',
      dateRange: 'all',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="loans-container">
      <h2>Loan Management</h2>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card total-loans">
          <h3>Total Loans</h3>
          <p>{loanStats.totalLoans}</p>
        </div>
        <div className="stat-card total-amount">
          <h3>Total Amount</h3>
          <p>M{loanStats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="stat-card approved">
          <h3>Approved</h3>
          <p>{loanStats.approved}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p>{loanStats.pending}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejected</h3>
          <p>{loanStats.rejected}</p>
        </div>
        <div className="stat-card defaulted">
          <h3>Defaulted</h3>
          <p>{loanStats.defaulted}</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search loans..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label><FaFilter /> Status:</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({...filters, status: e.target.value});
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label><FaFilter /> Repayment:</label>
            <select
              value={filters.repaymentStatus}
              onChange={(e) => {
                setFilters({...filters, repaymentStatus: e.target.value});
                setCurrentPage(1);
              }}
            >
              <option value="">All Repayment Statuses</option>
              {repaymentStatusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label><FaCalendarAlt /> Date Range:</label>
            <select
              value={filters.dateRange}
              onChange={(e) => {
                setFilters({...filters, dateRange: e.target.value});
                setCurrentPage(1);
              }}
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group amount-range">
            <label><FaFilter /> Amount Range:</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.minAmount}
              onChange={(e) => {
                setFilters({...filters, minAmount: e.target.value});
                setCurrentPage(1);
              }}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxAmount}
              onChange={(e) => {
                setFilters({...filters, maxAmount: e.target.value});
                setCurrentPage(1);
              }}
            />
          </div>

          <button 
            className="reset-filters"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <div className="add-loan-toggle" onClick={toggleForm}>
          <FaPlus /> <span>{showForm ? 'Cancel' : 'Add Loan'}</span>
        </div>

        <div className="export-buttons">
          <button onClick={exportToCSV}>
            <FaFileExport /> Export to CSV
          </button>
          <button onClick={handlePrint}>
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Loan Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="loan-form">
          <h3>{editingLoan ? 'Edit Loan' : 'Add New Loan'}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Borrower *</label>
              <select
                name="borrower"
                value={editingLoan?.borrower?._id ?? newLoan.borrower}
                onChange={(e) => handleChange(e, editingLoan ? setEditingLoan : setNewLoan)}
                required
              >
                <option value="">Select Borrower</option>
                {borrowers.map(borrower => (
                  <option key={borrower._id} value={borrower._id}>
                    {borrower.name} ({borrower.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount (M) *</label>
              <input
                name="amount"
                type="number"
                value={editingLoan?.amount ?? newLoan.amount}
                onChange={(e) => handleNumberChange(e, editingLoan ? setEditingLoan : setNewLoan)}
                placeholder="Loan Amount"
                required
                min="1"
                step="100"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Purpose *</label>
              <input
                name="purpose"
                type="text"
                value={editingLoan?.purpose ?? newLoan.purpose}
                onChange={(e) => handleChange(e, editingLoan ? setEditingLoan : setNewLoan)}
                placeholder="Loan Purpose"
                required
              />
            </div>

            <div className="form-group">
              <label>Interest Rate (%) *</label>
              <input
                name="interestRate"
                type="number"
                value={editingLoan?.interestRate ?? newLoan.interestRate}
                onChange={(e) => handleNumberChange(e, editingLoan ? setEditingLoan : setNewLoan)}
                placeholder="Interest Rate"
                required
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Loan Term (months) *</label>
              <input
                name="loanTerm"
                type="number"
                value={editingLoan?.loanTerm ?? newLoan.loanTerm}
                onChange={(e) => handleNumberChange(e, editingLoan ? setEditingLoan : setNewLoan)}
                placeholder="Loan Term"
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Repayment Start Date *</label>
              <DatePicker
                selected={editingLoan?.repaymentStartDate 
                  ? new Date(editingLoan.repaymentStartDate) 
                  : newLoan.repaymentStartDate ? new Date(newLoan.repaymentStartDate) : null}
                onChange={(date) => {
                  const dateString = date ? format(date, 'yyyy-MM-dd') : '';
                  if (editingLoan) {
                    setEditingLoan({...editingLoan, repaymentStartDate: dateString});
                  } else {
                    setNewLoan({...newLoan, repaymentStartDate: dateString});
                  }
                }}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                placeholderText="Select start date"
                className="date-picker-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={editingLoan?.status ?? newLoan.status}
                onChange={(e) => handleChange(e, editingLoan ? setEditingLoan : setNewLoan)}
                required
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Repayment Status *</label>
              <select
                name="repaymentStatus"
                value={editingLoan?.repaymentStatus ?? newLoan.repaymentStatus}
                onChange={(e) => handleChange(e, editingLoan ? setEditingLoan : setNewLoan)}
                required
              >
                {repaymentStatusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Collateral</label>
              <input
                name="collateral"
                type="text"
                value={editingLoan?.collateral ?? newLoan.collateral}
                onChange={(e) => handleChange(e, editingLoan ? setEditingLoan : setNewLoan)}
                placeholder="Collateral Description"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={editingLoan?.notes ?? newLoan.notes}
              onChange={(e) => handleChange(e, editingLoan ? setEditingLoan : setNewLoan)}
              placeholder="Additional notes about the loan"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingLoan ? 'Update Loan' : 'Add Loan'}
            </button>
            <button type="button" onClick={resetForm} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loans Table */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading loans...</p>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="no-results">
          <p>No loans found matching your criteria.</p>
          {(searchTerm || Object.values(filters).some(Boolean)) && (
            <button onClick={resetFilters}>Clear filters</button>
          )}
        </div>
      ) : (
        <div className="loans-table-container" ref={loansTableRef}>
          <table className="loans-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('borrower.name')}>
                  Borrower {sortConfig.key === 'borrower.name' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('amount')}>
                  Amount (M) {sortConfig.key === 'amount' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th>Purpose</th>
                <th onClick={() => requestSort('interestRate')}>
                  Interest {sortConfig.key === 'interestRate' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th>Term</th>
                <th onClick={() => requestSort('status')}>
                  Status {sortConfig.key === 'status' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('repaymentStatus')}>
                  Repayment {sortConfig.key === 'repaymentStatus' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('createdAt')}>
                  Created {sortConfig.key === 'createdAt' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLoans.map(loan => (
                <tr key={loan._id}>
                  <td>
                    {loan.borrower?.name || 'Unknown Borrower'}
                    {loan.borrower && (
                      <button 
                        onClick={() => viewBorrower(loan.borrower)}
                        className="icon-button"
                        aria-label="View Borrower"
                        title="View Borrower Details"
                      >
                        <FaUser />
                      </button>
                    )}
                  </td>
                  <td>M{loan.amount?.toLocaleString()}</td>
                  <td>{loan.purpose}</td>
                  <td>{loan.interestRate}%</td>
                  <td>{loan.loanTerm} months</td>
                  <td className={`status-${loan.status.toLowerCase()}`}>
                    {loan.status}
                  </td>
                  <td className={`repayment-${loan.repaymentStatus.toLowerCase().replace(' ', '-')}`}>
                    {loan.repaymentStatus}
                  </td>
                  <td>{format(parseISO(loan.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="actions no-print">
                    <button 
                      onClick={() => {
                        setEditingLoan(loan);
                        setShowForm(true);
                      }}
                      className="icon-button"
                      title="Edit Loan"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => deleteLoan(loan._id)}
                      className="icon-button"
                      title="Delete Loan"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredLoans.length > usersPerPage && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Loans;