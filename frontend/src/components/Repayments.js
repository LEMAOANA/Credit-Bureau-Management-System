import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Repayments.css';
import { 
  FaPlus, FaEdit, FaTrash, 
  FaChevronDown, FaChevronUp, 
  FaTimes, FaUserAlt, FaInfoCircle
} from 'react-icons/fa';

const API_URL = 'http://localhost:5001/api';
const PAYMENT_TYPES = ['Cash', 'Bank Transfer', 'Cheque', 'Transfer', 'Mobile Money'];
const DISPLAY_LIMIT = 10;

const Repayments = () => {
  const [state, setState] = useState({
    repayments: [],
    approvedLoans: [],
    loading: true,
    error: null,
    showForm: false,
    showAllRepayments: false,
    calculationData: null
  });

  const [formData, setFormData] = useState({
    loan: '',
    borrower: '',
    borrowerName: '',
    paymentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'Cash',
    paymentReference: '',
    notes: ''
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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

      setState(prev => ({
        ...prev,
        approvedLoans: loansRes.data?.data || loansRes.data || [],
        repayments: (repaymentsRes.data?.data || repaymentsRes.data || [])
          .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      }));

    } catch (error) {
      handleError('Error fetching data:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

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
        dueDate: new Date(loan.repaymentStartDate).toLocaleDateString()
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.loan) throw new Error('Please select a loan');
      if (!formData.paymentAmount || isNaN(formData.paymentAmount)) {
        throw new Error('Please enter a valid payment amount');
      }
      if (!formData.paymentDate) throw new Error('Please select a payment date');

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
    setFormData({
      loan: '',
      borrower: '',
      borrowerName: '',
      paymentAmount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: 'Cash',
      paymentReference: '',
      notes: ''
    });
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
    if (loan.borrower && typeof loan.borrower === 'object') {
      return loan.borrower.name;
    }
    return 'Unknown Borrower';
  };

  const getLoanDisplayText = (loan) => {
    if (!loan) return 'Unknown Loan';
    return `M${loan.amount?.toLocaleString()} @ ${loan.interestRate}% (${loan.status})`;
  };

  const displayedRepayments = state.showAllRepayments 
    ? state.repayments 
    : state.repayments.slice(0, DISPLAY_LIMIT);

  return (
    <div className="repayments-container">
      <h2 className="repayments-title">
        <FaInfoCircle style={{ marginRight: '0.5rem' }} />
        Repayment Management
      </h2>

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

      {state.showForm && (
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
              {state.approvedLoans.map((loan) => (
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
                  <div><strong>Loan Amount:</strong> M{state.calculationData.loanAmount?.toLocaleString()}</div>
                  <div><strong>Interest Rate:</strong> {state.calculationData.interestRate}%</div>
                  <div><strong>Loan Term:</strong> {state.calculationData.loanTerm} months</div>
                  <div><strong>Monthly Payment:</strong> M{state.calculationData.monthlyPayment?.toFixed(2)}</div>
                  <div><strong>Principal Portion:</strong> M{state.calculationData.principalPortion?.toFixed(2)}</div>
                  <div><strong>Interest Portion:</strong> M{state.calculationData.interestPortion?.toFixed(2)}</div>
                  <div><strong>Next Due Date:</strong> {state.calculationData.dueDate}</div>
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
      )}

      {state.loading ? (
        <div className="loading">Loading repayments...</div>
      ) : (
        <>
          {state.repayments.length > 0 ? (
            <div className="table-container">
              <table className="repayment-table">
                <thead>
                  <tr>
                    <th>Payment Date</th>
                    <th>Loan Details</th>
                    <th>Borrower</th>
                    <th>Amount (M)</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRepayments.map((repayment) => (
                    <tr key={repayment._id}>
                      <td>{new Date(repayment.paymentDate).toLocaleDateString()}</td>
                      <td>{getLoanDisplayText(repayment.loan)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaUserAlt /> 
                          {repayment.borrower?.name || 'Unknown'}
                        </div>
                      </td>
                      <td>M{repayment.paymentAmount?.toFixed(2)}</td>
                      <td>{repayment.paymentType}</td>
                      <td>{repayment.paymentReference || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => editRepayment(repayment)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => deleteRepayment(repayment._id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {state.repayments.length > DISPLAY_LIMIT && (
                <button 
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    showAllRepayments: !prev.showAllRepayments 
                  }))}
                >
                  {state.showAllRepayments ? (
                    <>
                      <FaChevronUp /> Show Less
                    </>
                  ) : (
                    <>
                      <FaChevronDown /> Show More ({state.repayments.length - DISPLAY_LIMIT} more)
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
              No repayments found
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Repayments;