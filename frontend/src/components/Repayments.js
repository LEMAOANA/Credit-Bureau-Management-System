import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './Repayments.css';
import { 
  FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, 
  FaTimes, FaUserAlt, FaInfoCircle, FaFilter, FaSearch,
  FaFileExport, FaPrint, FaCalendarAlt, FaChartLine
} from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Chart from 'react-apexcharts';

const API_URL = 'http://localhost:5001/api';
const PAYMENT_TYPES = ['Cash', 'Bank Transfer', 'Cheque', 'Transfer', 'Mobile Money'];
const DISPLAY_LIMIT = 10;
const INITIAL_FORM_DATA = {
  loan: '',
  borrower: '',
  borrowerName: '',
  paymentAmount: '',
  paymentDate: new Date().toISOString().split('T')[0],
  paymentType: 'Cash',
  paymentReference: '',
  notes: ''
};

const Repayments = () => {
  const [state, setState] = useState({
    repayments: [],
    approvedLoans: [],
    loading: true,
    error: null,
    showForm: false,
    showAllRepayments: false,
    calculationData: null,
    filters: {
      dateRange: { start: null, end: null },
      paymentType: '',
      minAmount: '',
      maxAmount: '',
      searchQuery: ''
    },
    currentPage: 1,
    sortConfig: { key: 'paymentDate', direction: 'desc' },
    showCharts: false
  });

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [repaymentsRes, loansRes] = await Promise.all([
        axios.get(`${API_URL}/repayments?populate=loan,borrower`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/loans?status=Approved&populate=borrower`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const repayments = (repaymentsRes.data?.data || repaymentsRes.data || [])
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

      setState(prev => ({
        ...prev,
        approvedLoans: loansRes.data?.data || loansRes.data || [],
        repayments
      }));

    } catch (error) {
      handleError('Error fetching data:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleError = (context, error) => {
    console.error(context, error);
    let errorMessage = error.response?.data?.message || error.message;
    
    if (error.response?.data?.errors) {
      errorMessage = Object.entries(error.response.data.errors)
        .map(([field, err]) => `${field}: ${err.message}`)
        .join('\n');
    }
    
    setState(prev => ({ ...prev, error: `${context} ${errorMessage}` }));
  };

  const handleLoanChange = (e) => {
    const loanId = e.target.value;
    const selectedLoan = state.approvedLoans.find(loan => loan._id === loanId);
    
    setFormData(prev => ({
      ...prev,
      loan: loanId,
      borrower: selectedLoan?.borrower?._id || selectedLoan?.borrower || '',
      borrowerName: getBorrowerName(selectedLoan)
    }));

    if (loanId) calculatePayment(loanId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'paymentAmount' && value !== '' && isNaN(value)) {
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatePayment = (loanId) => {
    const loan = state.approvedLoans.find(l => l._id === loanId);
    if (!loan) return;
    
    const monthlyPrincipal = loan.amount / loan.loanTerm;
    const monthlyInterest = (loan.amount * loan.interestRate) / (100 * 12);
    const totalPayment = monthlyPrincipal + monthlyInterest;
    
    setState(prev => ({
      ...prev,
      calculationData: {
        loanAmount: loan.amount,
        interestRate: loan.interestRate,
        loanTerm: loan.loanTerm,
        monthlyPayment: totalPayment,
        principalPortion: monthlyPrincipal,
        interestPortion: monthlyInterest,
        dueDate: new Date(loan.repaymentStartDate).toLocaleDateString(),
        remainingBalance: loan.amount - (loan.paidAmount || 0),
        totalPaid: loan.paidAmount || 0
      }
    }));
  };

  const validateFormData = () => {
    if (!formData.loan) throw new Error('Please select a loan');
    if (!formData.paymentAmount || isNaN(formData.paymentAmount)) {
      throw new Error('Please enter a valid payment amount');
    }
    if (!formData.paymentDate) throw new Error('Please select a payment date');
    
    // Check if payment exceeds remaining balance
    if (state.calculationData && 
        parseFloat(formData.paymentAmount) > state.calculationData.remainingBalance) {
      throw new Error('Payment amount exceeds remaining loan balance');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      validateFormData();

      const payload = {
        ...formData,
        paymentAmount: parseFloat(formData.paymentAmount),
        paymentDate: new Date(formData.paymentDate).toISOString(),
        ...(formData.paymentReference && { paymentReference: formData.paymentReference }),
        ...(formData.notes && { notes: formData.notes })
      };

      const response = await axios[editingId ? 'put' : 'post'](
        `${API_URL}/repayments${editingId ? `/${editingId}` : ''}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        await fetchData();
        resetForm();
      } else {
        throw new Error(response.data.message || 'Operation failed');
      }
    } catch (error) {
      handleError('Failed to save repayment:', error);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingId(null);
    setState(prev => ({ ...prev, showForm: false, calculationData: null }));
  };

  const editRepayment = (repayment) => {
    const loan = state.approvedLoans.find(l => l._id === (repayment.loan?._id || repayment.loan));
    
    setFormData({
      loan: repayment.loan?._id || repayment.loan,
      borrower: repayment.borrower?._id || repayment.borrower,
      borrowerName: getBorrowerName(loan),
      paymentAmount: repayment.paymentAmount,
      paymentDate: repayment.paymentDate.split('T')[0],
      paymentType: repayment.paymentType,
      paymentReference: repayment.paymentReference,
      notes: repayment.notes
    });
    
    setEditingId(repayment._id);
    setState(prev => ({ ...prev, showForm: true }));
    calculatePayment(repayment.loan?._id || repayment.loan);
  };

  const deleteRepayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this repayment?')) return;

    try {
      await axios.delete(`${API_URL}/repayments/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setState(prev => ({
        ...prev,
        repayments: prev.repayments.filter(r => r._id !== id)
      }));
    } catch (error) {
      handleError('Error deleting repayment:', error);
    }
  };

  const getBorrowerName = (loan) => {
    if (!loan) return 'Unknown Borrower';
    return loan.borrower?.name || 'Unknown Borrower';
  };

  const getLoanDisplayText = (loan) => {
    if (!loan) return 'Unknown Loan';
    return `M${loan.amount?.toLocaleString()} @ ${loan.interestRate}% (${loan.status})`;
  };

  // Enhanced filtering and sorting
  const filteredRepayments = useMemo(() => {
    let result = [...state.repayments];
    
    // Apply filters
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      result = result.filter(repayment => 
        (repayment.borrower?.name?.toLowerCase().includes(query)) ||
        (repayment.paymentReference?.toLowerCase().includes(query)) ||
        (repayment.notes?.toLowerCase().includes(query)) ||
        (getLoanDisplayText(repayment.loan).toLowerCase().includes(query)
      ));
    }
    
    if (state.filters.paymentType) {
      result = result.filter(r => r.paymentType === state.filters.paymentType);
    }
    
    if (state.filters.minAmount) {
      result = result.filter(r => r.paymentAmount >= parseFloat(state.filters.minAmount));
    }
    
    if (state.filters.maxAmount) {
      result = result.filter(r => r.paymentAmount <= parseFloat(state.filters.maxAmount));
    }
    
    if (state.filters.dateRange.start && state.filters.dateRange.end) {
      result = result.filter(r => {
        const paymentDate = new Date(r.paymentDate);
        return paymentDate >= state.filters.dateRange.start && 
               paymentDate <= state.filters.dateRange.end;
      });
    }
    
    // Apply sorting
    if (state.sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[state.sortConfig.key] || a.loan?.[state.sortConfig.key];
        const bValue = b[state.sortConfig.key] || b.loan?.[state.sortConfig.key];
        
        if (aValue < bValue) {
          return state.sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return state.sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [state.repayments, state.filters, state.sortConfig]);

  // Pagination logic
  const usersPerPage = DISPLAY_LIMIT;
  const totalPages = Math.ceil(filteredRepayments.length / usersPerPage);
  const paginatedRepayments = filteredRepayments.slice(
    (state.currentPage - 1) * usersPerPage,
    state.currentPage * usersPerPage
  );

  const requestSort = (key) => {
    let direction = 'asc';
    if (state.sortConfig.key === key && state.sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setState(prev => ({ ...prev, sortConfig: { key, direction } }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [name]: value
      },
      currentPage: 1
    }));
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        dateRange: { start, end }
      },
      currentPage: 1
    }));
  };

  const resetFilters = () => {
    setState(prev => ({
      ...prev,
      filters: {
        dateRange: { start: null, end: null },
        paymentType: '',
        minAmount: '',
        maxAmount: '',
        searchQuery: ''
      },
      currentPage: 1
    }));
  };

  // Prepare data for CSV export
  const csvData = filteredRepayments.map(repayment => ({
    'Payment Date': new Date(repayment.paymentDate).toLocaleDateString(),
    'Loan Amount': repayment.loan?.amount,
    'Interest Rate': repayment.loan?.interestRate,
    'Borrower': repayment.borrower?.name || 'Unknown',
    'Amount': repayment.paymentAmount,
    'Type': repayment.paymentType,
    'Reference': repayment.paymentReference || 'N/A',
    'Notes': repayment.notes || ''
  }));

  // Prepare chart data
  const paymentTrendsData = {
    options: {
      chart: {
        id: 'payment-trends',
        toolbar: {
          show: false
        }
      },
      xaxis: {
        type: 'datetime',
        categories: filteredRepayments
          .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))
          .map(r => new Date(r.paymentDate).getTime())
      },
      title: {
        text: 'Payment Trends Over Time',
        align: 'center'
      },
      stroke: {
        curve: 'smooth'
      }
    },
    series: [
      {
        name: 'Payment Amount',
        data: filteredRepayments
          .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))
          .map(r => r.paymentAmount)
      }
    ]
  };

  const paymentTypeDistribution = {
    options: {
      chart: {
        type: 'pie',
      },
      title: {
        text: 'Payment Type Distribution',
        align: 'center'
      },
      labels: PAYMENT_TYPES
    },
    series: PAYMENT_TYPES.map(type => 
      filteredRepayments.filter(r => r.paymentType === type).length
    )
  };

  return (
    <div className="repayments-container">
      <div className="repayments-header">
        <h2 className="repayments-title">
          <FaChartLine /> Repayment Management
        </h2>
        
        <div className="action-buttons">
          <button 
            className="btn btn-secondary" 
            onClick={() => setState(prev => ({ 
              ...prev, 
              showForm: !prev.showForm,
              calculationData: null
            }))}
          >
            <FaPlus /> 
            <span>{state.showForm ? 'Cancel' : 'Add Repayment'}</span>
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> 
            <span>Filters</span>
          </button>
          
          <CSVLink 
            data={csvData} 
            filename="repayments-export.csv"
            className="btn btn-secondary"
          >
            <FaFileExport /> Export
          </CSVLink>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => window.print()}
          >
            <FaPrint /> Print
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => setState(prev => ({ ...prev, showCharts: !prev.showCharts }))}
          >
            <FaChartLine /> {state.showCharts ? 'Hide Charts' : 'Show Charts'}
          </button>
        </div>
      </div>

      {state.error && (
        <div className="error-message">
          <div>{state.error}</div>
          <button 
            onClick={() => setState(prev => ({ ...prev, error: null }))} 
            className="btn btn-cancel"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>
              <FaSearch /> Search
            </label>
            <input
              type="text"
              name="searchQuery"
              value={state.filters.searchQuery}
              onChange={handleFilterChange}
              placeholder="Search by borrower, reference, notes..."
            />
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>
                <FaCalendarAlt /> Date Range
              </label>
              <DatePicker
                selectsRange={true}
                startDate={state.filters.dateRange.start}
                endDate={state.filters.dateRange.end}
                onChange={handleDateRangeChange}
                isClearable={true}
                placeholderText="Select date range"
              />
            </div>
            
            <div className="filter-group">
              <label>Payment Type</label>
              <select
                name="paymentType"
                value={state.filters.paymentType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                {PAYMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Min Amount</label>
              <input
                type="number"
                name="minAmount"
                value={state.filters.minAmount}
                onChange={handleFilterChange}
                placeholder="Minimum amount"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="filter-group">
              <label>Max Amount</label>
              <input
                type="number"
                name="maxAmount"
                value={state.filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="Maximum amount"
                min="0"
                step="0.01"
              />
            </div>
            
            <button 
              className="btn btn-cancel" 
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {state.showForm && (
        <RepaymentForm 
          formData={formData}
          state={state}
          editingId={editingId}
          approvedLoans={state.approvedLoans}
          handleLoanChange={handleLoanChange}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          getLoanDisplayText={getLoanDisplayText}
          PAYMENT_TYPES={PAYMENT_TYPES}
        />
      )}

      {state.showCharts && (
        <div className="charts-container">
          <div className="chart">
            <Chart 
              options={paymentTrendsData.options}
              series={paymentTrendsData.series}
              type="line"
              height={350}
            />
          </div>
          <div className="chart">
            <Chart 
              options={paymentTypeDistribution.options}
              series={paymentTypeDistribution.series}
              type="pie"
              height={350}
            />
          </div>
        </div>
      )}

      {state.loading ? (
        <div className="loading">Loading repayments...</div>
      ) : (
        <RepaymentsTable 
          repayments={paginatedRepayments}
          totalRepayments={filteredRepayments.length}
          sortConfig={state.sortConfig}
          requestSort={requestSort}
          currentPage={state.currentPage}
          totalPages={totalPages}
          setState={setState}
          editRepayment={editRepayment}
          deleteRepayment={deleteRepayment}
          getLoanDisplayText={getLoanDisplayText}
        />
      )}
    </div>
  );
};

const RepaymentForm = ({
  formData,
  state,
  editingId,
  approvedLoans,
  handleLoanChange,
  handleInputChange,
  handleSubmit,
  resetForm,
  getLoanDisplayText,
  PAYMENT_TYPES
}) => (
  <form onSubmit={handleSubmit} className="repayment-form">
    <h3>{editingId ? 'Edit Repayment' : 'Add New Repayment'}</h3>

    <div className="form-group">
      <label>Select Approved Loan</label>
      <select
        name="loan"
        value={formData.loan}
        onChange={handleLoanChange}
        required
      >
        <option value="">Select a Loan</option>
        {approvedLoans.map((loan) => (
          <option key={loan._id} value={loan._id}>
            {getLoanDisplayText(loan)}
          </option>
        ))}
      </select>
    </div>

    {formData.loan && (
      <>
        <div className="form-group">
          <label>Borrower</label>
          <input 
            type="text" 
            value={formData.borrowerName} 
            readOnly 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Payment Amount (M)</label>
            <input 
              type="number" 
              name="paymentAmount"
              value={formData.paymentAmount}
              onChange={handleInputChange} 
              required
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Payment Date</label>
            <input 
              type="date" 
              name="paymentDate" 
              value={formData.paymentDate}
              onChange={handleInputChange} 
              required 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Payment Type</label>
            <select 
              name="paymentType" 
              value={formData.paymentType} 
              onChange={handleInputChange}
            >
              {PAYMENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Payment Reference</label>
            <input 
              type="text" 
              name="paymentReference"
              value={formData.paymentReference} 
              onChange={handleInputChange} 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea 
            name="notes"
            value={formData.notes} 
            onChange={handleInputChange} 
            rows="3"
          />
        </div>

        {state.calculationData && (
          <div className="calculation-result">
            <h4>Loan Calculation Details</h4>
            <div className="calculation-grid">
              <div><strong>Loan Amount:</strong> M{state.calculationData.loanAmount?.toLocaleString()}</div>
              <div><strong>Interest Rate:</strong> {state.calculationData.interestRate}%</div>
              <div><strong>Loan Term:</strong> {state.calculationData.loanTerm} months</div>
              <div><strong>Monthly Payment:</strong> M{state.calculationData.monthlyPayment?.toFixed(2)}</div>
              <div><strong>Principal Portion:</strong> M{state.calculationData.principalPortion?.toFixed(2)}</div>
              <div><strong>Interest Portion:</strong> M{state.calculationData.interestPortion?.toFixed(2)}</div>
              <div><strong>Next Due Date:</strong> {state.calculationData.dueDate}</div>
              <div><strong>Remaining Balance:</strong> M{state.calculationData.remainingBalance?.toFixed(2)}</div>
              <div><strong>Total Paid:</strong> M{state.calculationData.totalPaid?.toFixed(2)}</div>
            </div>
          </div>
        )}

        <div className="form-buttons">
          <button 
            type="button" 
            className="btn btn-cancel"
            onClick={resetForm}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
          >
            {editingId ? 'Update' : 'Save'} Repayment
          </button>
        </div>
      </>
    )}
  </form>
);

const RepaymentsTable = ({
  repayments,
  totalRepayments,
  sortConfig,
  requestSort,
  currentPage,
  totalPages,
  setState,
  editRepayment,
  deleteRepayment,
  getLoanDisplayText
}) => {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FaChevronUp /> : <FaChevronDown />;
  };

  return (
    <div className="table-responsive">
      {repayments.length > 0 ? (
        <>
          <div className="table-summary">
            Showing {repayments.length} of {totalRepayments} repayments
          </div>
          
          <table className="repayment-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('paymentDate')}>
                  Payment Date {getSortIcon('paymentDate')}
                </th>
                <th onClick={() => requestSort('amount')}>
                  Loan Details {getSortIcon('amount')}
                </th>
                <th onClick={() => requestSort('name')}>
                  Borrower {getSortIcon('name')}
                </th>
                <th onClick={() => requestSort('paymentAmount')}>
                  Amount (M) {getSortIcon('paymentAmount')}
                </th>
                <th>Type</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {repayments.map((repayment) => (
                <tr key={repayment._id}>
                  <td>{new Date(repayment.paymentDate).toLocaleDateString()}</td>
                  <td>{getLoanDisplayText(repayment.loan)}</td>
                  <td>
                    <div className="borrower-cell">
                      <FaUserAlt /> 
                      {repayment.borrower?.name || 'Unknown'}
                    </div>
                  </td>
                  <td>M{repayment.paymentAmount?.toFixed(2)}</td>
                  <td>
                    <span className={`payment-type ${repayment.paymentType.toLowerCase().replace(' ', '-')}`}>
                      {repayment.paymentType}
                    </span>
                  </td>
                  <td>{repayment.paymentReference || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon edit-icon" 
                        onClick={() => editRepayment(repayment)}
                        title="Edit Repayment"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-icon delete-icon" 
                        onClick={() => deleteRepayment(repayment._id)}
                        title="Delete Repayment"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
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
                    onClick={() => setState(prev => ({ ...prev, currentPage: number }))}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, totalPages) }))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-results">
          <FaInfoCircle /> No repayments found matching your criteria
        </div>
      )}
    </div>
  );
};

export default Repayments;