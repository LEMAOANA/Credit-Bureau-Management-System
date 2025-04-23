import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './Borrowers.css';
import { 
  FaPlus, FaEdit, FaTrash, FaFileAlt, FaChevronDown, FaChevronUp,
  FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaUserAlt,
  FaCalendarAlt, FaMoneyBillWave, FaIdCard, FaInfoCircle
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';

const Borrowers = () => {
  // State declarations
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBorrower, setNewBorrower] = useState(initialFormState());
  const [editingBorrower, setEditingBorrower] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [formErrors, setFormErrors] = useState({});
  const [stats, setStats] = useState({ total: 0, active: 0, overdue: 0, totalLoanAmount: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minLoanAmount: '',
    maxLoanAmount: '',
    startDate: null,
    endDate: null
  });

  function initialFormState() {
    return {
      name: '',
      email: '',
      phone: '',
      loanAmount: '',
      loanPurpose: '',
      nationalId: '',
      repaymentStartDate: new Date(),
      loanTerm: '',
      interestRate: '',
      status: 'pending',
    };
  }

  useEffect(() => {
    fetchBorrowers();
  }, []);

  useEffect(() => {
    if (borrowers.length > 0) {
      calculateStats();
    }
  }, [borrowers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, sortConfig, advancedFilters]);

  const fetchBorrowers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/borrowers');
      if (response.data.success) {
        setBorrowers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching borrowers:', error);
      alert('Failed to fetch borrowers');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = borrowers.length;
    const active = borrowers.filter(b => b.status === 'active').length;
    const overdue = borrowers.filter(b => b.status === 'defaulted').length;
    const totalLoanAmount = borrowers.reduce((sum, b) => sum + (parseFloat(b.loanAmount) || 0), 0);
    setStats({ total, active, overdue, totalLoanAmount });
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    }
    if (!data.phone.trim()) errors.phone = 'Phone is required';
    if (!data.loanAmount) errors.loanAmount = 'Loan amount is required';
    if (!data.repaymentStartDate) errors.repaymentStartDate = 'Repayment date is required';
    if (!data.loanTerm) errors.loanTerm = 'Loan term is required';
    if (!data.interestRate) errors.interestRate = 'Interest rate is required';
    if (!data.nationalId) errors.nationalId = 'National ID is required';
    
    return errors;
  };

  const handleChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (date, name, setter) => {
    setter(prev => ({ ...prev, [name]: date }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAdvancedFilterChange = (e) => {
    const { name, value } = e.target;
    setAdvancedFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAdvancedDateChange = (date, name) => {
    setAdvancedFilters(prev => ({ ...prev, [name]: date }));
  };

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      minLoanAmount: '',
      maxLoanAmount: '',
      startDate: null,
      endDate: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = editingBorrower || newBorrower;
    const errors = validateForm(data);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingBorrower) {
        await updateBorrower();
      } else {
        await addBorrower();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error?.response?.data?.message || 'An error occurred');
    }
  };

  const addBorrower = async () => {
    const response = await axios.post('http://localhost:5001/api/borrowers', {
      ...newBorrower,
      repaymentStartDate: format(newBorrower.repaymentStartDate, 'yyyy-MM-dd')
    });
    if (response.data.success) {
      setBorrowers([response.data.data, ...borrowers]);
      resetForm();
      alert('Borrower added successfully!');
    }
  };

  const updateBorrower = async () => {
    const response = await axios.put(
      `http://localhost:5001/api/borrowers/${editingBorrower._id}`,
      {
        ...editingBorrower,
        repaymentStartDate: format(editingBorrower.repaymentStartDate, 'yyyy-MM-dd')
      }
    );
    if (response.data.success) {
      setBorrowers(borrowers.map(b => b._id === editingBorrower._id ? response.data.data : b));
      resetForm();
      alert('Borrower updated successfully!');
    }
  };

  const resetForm = () => {
    setNewBorrower(initialFormState());
    setEditingBorrower(null);
    setShowForm(false);
    setFormErrors({});
  };

  const deleteBorrower = async (id) => {
    if (!window.confirm('Are you sure you want to delete this borrower and all associated data?')) return;

    try {
      const response = await axios.delete(`http://localhost:5001/api/borrowers/${id}`);
      if (response.data.success) {
        setBorrowers(borrowers.filter(b => b._id !== id));
        alert('Borrower deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting borrower:', error);
      alert('Failed to delete borrower');
    }
  };

  const viewLoans = (id) => {
    alert(`Viewing loans for borrower ID: ${id}`);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'defaulted': return 'status-defaulted';
      default: return '';
    }
  };

  const filteredBorrowers = useMemo(() => {
    let result = [...borrowers];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.name.toLowerCase().includes(term) || 
        b.email.toLowerCase().includes(term) ||
        b.phone.toLowerCase().includes(term) ||
        b.nationalId.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(b => b.status === activeFilter);
    }
    
    // Apply advanced filters
    if (advancedFilters.minLoanAmount) {
      result = result.filter(b => parseFloat(b.loanAmount) >= parseFloat(advancedFilters.minLoanAmount));
    }
    if (advancedFilters.maxLoanAmount) {
      result = result.filter(b => parseFloat(b.loanAmount) <= parseFloat(advancedFilters.maxLoanAmount));
    }
    if (advancedFilters.startDate) {
      result = result.filter(b => new Date(b.createdAt) >= advancedFilters.startDate);
    }
    if (advancedFilters.endDate) {
      result = result.filter(b => new Date(b.createdAt) <= advancedFilters.endDate);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [borrowers, searchTerm, activeFilter, sortConfig, advancedFilters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBorrowers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentBorrowers = filteredBorrowers.slice(indexOfFirstUser, indexOfLastUser);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const exportToCSV = () => {
    const csvData = filteredBorrowers.map(borrower => ({
      Name: borrower.name,
      Email: borrower.email,
      Phone: borrower.phone,
      'Loan Amount (M)': borrower.loanAmount,
      'Loan Purpose': borrower.loanPurpose,
      'National ID': borrower.nationalId,
      Status: borrower.status,
      'Created Date': format(parseISO(borrower.createdAt), 'yyyy-MM-dd'),
      'Repayment Start': format(parseISO(borrower.repaymentStartDate), 'yyyy-MM-dd'),
      'Loan Term (months)': borrower.loanTerm,
      'Interest Rate (%)': borrower.interestRate,
      Address: borrower.address,
      Employment: borrower.employment,
      Income: borrower.income,
      Notes: borrower.notes
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => 
      Object.values(row).map(value => 
        `"${String(value).replace(/"/g, '""')}"`
      ).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `borrowers_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'defaulted', label: 'Defaulted' }
  ];

  const calculateMonthlyPayment = (amount, term, rate) => {
    if (!amount || !term || !rate) return 0;
    const principal = parseFloat(amount);
    const monthlyRate = parseFloat(rate) / 100 / 12;
    const payments = parseFloat(term);
    
    // EMI formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, payments) / 
                (Math.pow(1 + monthlyRate, payments) - 1);
    
    return emi.toFixed(2);
  };

  return (
    <div className="borrowers-container">
      <h2 className="borrowers-title">Borrower Management</h2>
      
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card total">
          <h3>Total Borrowers</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card active">
          <h3>Active Loans</h3>
          <p>{stats.active}</p>
        </div>
        <div className="stat-card overdue">
          <h3>Overdue</h3>
          <p>{stats.overdue}</p>
        </div>
        <div className="stat-card amount">
          <h3>Total Loan Amount</h3>
          <p>M{stats.totalLoanAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-filter-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search borrowers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-dropdown">
            <FaFilter className="filter-icon" />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <button 
            className="advanced-filter-toggle"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
            Advanced Filters
          </button>
        </div>
        
        <div className="action-buttons">
          <button className="add-borrower-toggle" onClick={() => setShowForm(!showForm)}>
            <FaPlus /> <span>{showForm ? 'Cancel' : 'Add Borrower'}</span>
          </button>

          <button className="export-button" onClick={exportToCSV}>
            Export to CSV
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="advanced-filters">
          <h4>Advanced Filters</h4>
          <div className="filter-grid">
            <div className="filter-group">
              <label>Loan Amount Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  name="minLoanAmount"
                  value={advancedFilters.minLoanAmount}
                  onChange={handleAdvancedFilterChange}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  name="maxLoanAmount"
                  value={advancedFilters.maxLoanAmount}
                  onChange={handleAdvancedFilterChange}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range-inputs">
                <DatePicker
                  selected={advancedFilters.startDate}
                  onChange={(date) => handleAdvancedDateChange(date, 'startDate')}
                  selectsStart
                  startDate={advancedFilters.startDate}
                  endDate={advancedFilters.endDate}
                  placeholderText="Start Date"
                  className="date-input"
                />
                <span>to</span>
                <DatePicker
                  selected={advancedFilters.endDate}
                  onChange={(date) => handleAdvancedDateChange(date, 'endDate')}
                  selectsEnd
                  startDate={advancedFilters.startDate}
                  endDate={advancedFilters.endDate}
                  minDate={advancedFilters.startDate}
                  placeholderText="End Date"
                  className="date-input"
                />
              </div>
            </div>
          </div>
          
          <div className="filter-actions">
            <button 
              type="button" 
              onClick={resetAdvancedFilters}
              className="btn-clear"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Borrower Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="borrower-form">
          <h3>{editingBorrower ? 'Edit Borrower' : 'Add New Borrower'}</h3>
          
          <div className="form-grid">
            <div className={`form-group ${formErrors.name ? 'error' : ''}`}>
              <label>Name*</label>
              <input
                type="text"
                name="name"
                value={editingBorrower ? editingBorrower.name : newBorrower.name}
                onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
                placeholder="Full name"
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
            </div>
            
            <div className={`form-group ${formErrors.email ? 'error' : ''}`}>
              <label>Email*</label>
              <input
                type="email"
                name="email"
                value={editingBorrower ? editingBorrower.email : newBorrower.email}
                onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
                placeholder="Email address"
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
            </div>
            
            <div className={`form-group ${formErrors.phone ? 'error' : ''}`}>
              <label>Phone*</label>
              <input
                type="tel"
                name="phone"
                value={editingBorrower ? editingBorrower.phone : newBorrower.phone}
                onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
                placeholder="Phone number"
              />
              {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
            </div>
            
            <div className={`form-group ${formErrors.nationalId ? 'error' : ''}`}>
              <label>National ID*</label>
              <input
                type="text"
                name="nationalId"
                value={editingBorrower ? editingBorrower.nationalId : newBorrower.nationalId}
                onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
                placeholder="National identification number"
              />
              {formErrors.nationalId && <span className="error-message">{formErrors.nationalId}</span>}
            </div>
            
            <div className={`form-group ${formErrors.loanAmount ? 'error' : ''}`}>
              <label>Loan Amount (M)*</label>
              <div className="input-with-icon">
                <FaMoneyBillWave className="input-icon" />
                <input
                  type="number"
                  name="loanAmount"
                  value={editingBorrower ? editingBorrower.loanAmount : newBorrower.loanAmount}
                  onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
                  placeholder="Loan amount"
                  step="0.01"
                />
              </div>
              {formErrors.loanAmount && <span className="error-message">{formErrors.loanAmount}</span>}
            </div>
            
            <div className="form-group">
              <label>Loan Purpose</label>
              <input
                type="text"
                name="loanPurpose"
                value={editingBorrower ? editingBorrower.loanPurpose : newBorrower.loanPurpose}
                onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
                placeholder="Purpose of the loan"
              />
            </div>
            
            <div className={`form-group ${formErrors.repaymentStartDate ? 'error' : ''}`}>
              <label>Repayment Start Date*</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <DatePicker
                  selected={editingBorrower ? 
                    (editingBorrower.repaymentStartDate instanceof Date ? 
                      editingBorrower.repaymentStartDate : 
                      new Date(editingBorrower.repaymentStartDate)) : 
                    newBorrower.repaymentStartDate}
                  onChange={(date) => handleDateChange(date, 'repaymentStartDate', editingBorrower ? setEditingBorrower : setNewBorrower)}
                  dateFormat="MM/dd/yyyy"
                  minDate={new Date()}
                  placeholderText="Select date"
                />
              </div>
              {formErrors.repaymentStartDate && <span className="error-message">{formErrors.repaymentStartDate}</span>}
            </div>
            
            <div className={`form-group ${formErrors.loanTerm ? 'error' : ''}`}>
              <label>Loan Term (months)*</label>
              <input
                type="number"
                name="loanTerm"
                value={editingBorrower ? editingBorrower.loanTerm : newBorrower.loanTerm}
                onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
                placeholder="Loan duration in months"
              />
              {formErrors.loanTerm && <span className="error-message">{formErrors.loanTerm}</span>}
            </div>
            
            <div className={`form-group ${formErrors.interestRate ? 'error' : ''}`}>
              <label>Interest Rate (%)*</label>
              <input
                type="number"
                name="interestRate"
                value={editingBorrower ? editingBorrower.interestRate : newBorrower.interestRate}
                onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
                placeholder="Annual interest rate"
                step="0.01"
              />
              {formErrors.interestRate && <span className="error-message">{formErrors.interestRate}</span>}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingBorrower ? 'Update Borrower' : 'Add Borrower'}
            </button>
            <button type="button" onClick={resetForm} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Borrowers Table */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading borrowers...</p>
        </div>
      ) : filteredBorrowers.length === 0 ? (
        <div className="empty-state">
          <FaUserAlt className="empty-icon" />
          <p>No borrowers found</p>
          {(searchTerm || activeFilter !== 'all' || advancedFilters.minLoanAmount || 
            advancedFilters.maxLoanAmount || advancedFilters.startDate || advancedFilters.endDate) ? (
            <button onClick={() => { 
              setSearchTerm(''); 
              setActiveFilter('all'); 
              resetAdvancedFilters();
            }}>
              Clear all filters
            </button>
          ) : (
            <button onClick={() => setShowForm(true)}>
              Add New Borrower
            </button>
          )}
        </div>
      ) : (
        <div className="borrowers-table-container">
          <div className="table-info">
            Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredBorrowers.length)} of {filteredBorrowers.length} borrowers
          </div>
          
          <table className="borrowers-table">
  <thead>
    <tr>
      <th onClick={() => requestSort('name')}>
        <div className="th-content">
          Name {getSortIcon('name')}
        </div>
      </th>
      <th>Contact</th>
      <th onClick={() => requestSort('loanAmount')}>
        <div className="th-content">
          Loan (M) {getSortIcon('loanAmount')}
        </div>
      </th>
      <th>Purpose</th>
      <th onClick={() => requestSort('createdAt')}>
        <div className="th-content">
          Created {getSortIcon('createdAt')}
        </div>
      </th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {currentBorrowers.map((borrower) => (
      <tr key={borrower._id}>
        <td>
          <div className="borrower-name">
            <FaUserAlt className="user-icon" />
            <span>{borrower.name}</span>
          </div>
        </td>
        <td>
          <div className="contact-info">
            {borrower.email?.includes('@gmail.com') ? borrower.email : '-'}
          </div>
        </td>
        <td className="loan-amount">
          M{parseFloat(borrower.loanAmount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </td>
        <td className="loan-purpose">
          {borrower.loanPurpose || '-'}
        </td>
        <td>
          {format(parseISO(borrower.createdAt), 'MMM dd, yyyy')}
        </td>
        <td>
          <div className="action-buttons">
            <button 
              onClick={() => { 
                setEditingBorrower({
                  ...borrower,
                  repaymentStartDate: new Date(borrower.repaymentStartDate)
                }); 
                setShowForm(true); 
              }}
              className="btn-edit"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button 
              onClick={() => deleteBorrower(borrower._id)}
              className="btn-delete"
              title="Delete"
            >
              <FaTrash />
            </button>
            <button 
              onClick={() => viewLoans(borrower._id)}
              className="btn-view"
              title="View Loans"
            >
              <FaFileAlt />
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>


          {/* Pagination */}
          {filteredBorrowers.length > usersPerPage && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={currentPage === number ? 'active' : ''}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
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

export default Borrowers;