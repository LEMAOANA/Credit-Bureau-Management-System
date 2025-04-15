import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Loans.css';
import { FaPlus, FaEdit, FaTrash, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Loans = () => {
  const initialLoanState = () => ({
    borrower: '',
    amount: '',
    purpose: '',
    status: 'Pending',
    repaymentStatus: 'Not Started',
    interestRate: '',
    loanTerm: '',
    repaymentStartDate: ''
  });

  const [loans, setLoans] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLoan, setNewLoan] = useState(initialLoanState());
  const [editLoan, setEditLoan] = useState(null);
  const [showAddLoanForm, setShowAddLoanForm] = useState(false);
  const [showAllLoans, setShowAllLoans] = useState(false);
  const [errors, setErrors] = useState({});
  const displayLimit = 10;

  // Fetch loans and borrowers data
  useEffect(() => {
    fetchLoans();
    fetchBorrowers();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/loans');
      if (res.data.success) {
        // Sort loans by createdAt date (newest first)
        const sortedLoans = res.data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLoans(sortedLoans);
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowers = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/borrowers');
      if (res.data.success) {
        setBorrowers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching borrowers:', err);
    }
  };

  const validateForm = (loanData) => {
    const newErrors = {};
    
    if (!loanData.borrower) newErrors.borrower = 'Borrower is required';
    if (!loanData.amount || isNaN(loanData.amount)) 
      newErrors.amount = 'Valid amount is required';
    if (!loanData.purpose) newErrors.purpose = 'Purpose is required';
    if (!loanData.interestRate || isNaN(loanData.interestRate))
      newErrors.interestRate = 'Valid interest rate is required';
    if (!loanData.loanTerm || isNaN(loanData.loanTerm))
      newErrors.loanTerm = 'Valid loan term is required';
    if (!loanData.repaymentStartDate) 
      newErrors.repaymentStartDate = 'Repayment start date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e, stateSetter) => {
    const { name, value } = e.target;
    stateSetter(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e, stateSetter) => {
    const { name, value } = e.target;
    if (value === '' || !isNaN(value)) {
      stateSetter(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddLoan = async (e) => {
    e.preventDefault();
    
    if (!validateForm(newLoan)) return;

    try {
      // Convert string numbers to actual numbers
      const payload = {
        ...newLoan,
        amount: Number(newLoan.amount),
        interestRate: Number(newLoan.interestRate),
        loanTerm: Number(newLoan.loanTerm)
      };

      const res = await axios.post('http://localhost:5001/api/loans', payload);
      if (res.data.success) {
        setLoans([res.data.data, ...loans]);
        setNewLoan(initialLoanState());
        setShowAddLoanForm(false);
        alert('Loan added successfully!');
      }
    } catch (err) {
      console.error('Error adding loan:', err);
      alert('There was an error adding the loan: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateLoan = async (e) => {
    e.preventDefault();
    
    if (!validateForm(editLoan)) return;

    try {
      // Convert string numbers to actual numbers
      const payload = {
        ...editLoan,
        amount: Number(editLoan.amount),
        interestRate: Number(editLoan.interestRate),
        loanTerm: Number(editLoan.loanTerm)
      };

      const res = await axios.put(`http://localhost:5001/api/loans/${editLoan._id}`, payload);
      if (res.data.success) {
        setLoans(loans.map(loan => 
          loan._id === editLoan._id ? res.data.data : loan
        ));
        setEditLoan(null);
        alert('Loan updated successfully!');
      }
    } catch (error) {
      console.error('Error updating loan:', error);
      alert('There was an error updating the loan.');
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) return;

    try {
      const res = await axios.delete(`http://localhost:5001/api/loans/${loanId}`);
      if (res.data.success) {
        setLoans(loans.filter(loan => loan._id !== loanId));
      }
    } catch (err) {
      console.error('Error deleting loan:', err);
      alert('Error deleting loan: ' + (err.response?.data?.message || err.message));
    }
  };

  const viewBorrower = (borrowerId) => {
    alert(`Viewing borrower details for ID: ${borrowerId}`);
  };

  const resetForm = () => {
    setNewLoan(initialLoanState());
    setEditLoan(null);
    setShowAddLoanForm(false);
    setErrors({});
  };

  if (loading) return <p className="loading">Loading loans...</p>;

  const displayedLoans = showAllLoans ? loans : loans.slice(0, displayLimit);

  return (
    <div className="loans-container">
      <h2>Loan Management</h2>

      <div className="add-loan-toggle" onClick={() => setShowAddLoanForm(!showAddLoanForm)}>
        <FaPlus /> <span>{showAddLoanForm ? 'Cancel' : 'Add Loan'}</span>
      </div>

      {showAddLoanForm && (
        <form onSubmit={handleAddLoan} className="loan-form">
          <h3>Add New Loan</h3>
          
          <div className="form-group">
            <select
              name="borrower"
              value={newLoan.borrower}
              onChange={(e) => handleInputChange(e, setNewLoan)}
              required
            >
              <option value="">Select Borrower</option>
              {borrowers.map(borrower => (
                <option key={borrower._id} value={borrower._id}>
                  {borrower.name} ({borrower.email})
                </option>
              ))}
            </select>
            {errors.borrower && <span className="error">{errors.borrower}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="amount"
              value={newLoan.amount}
              onChange={(e) => handleNumberChange(e, setNewLoan)}
              placeholder="Loan Amount"
              required
            />
            {errors.amount && <span className="error">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="purpose"
              value={newLoan.purpose}
              onChange={(e) => handleInputChange(e, setNewLoan)}
              placeholder="Loan Purpose"
              required
            />
            {errors.purpose && <span className="error">{errors.purpose}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="interestRate"
              value={newLoan.interestRate}
              onChange={(e) => handleNumberChange(e, setNewLoan)}
              placeholder="Interest Rate (%)"
              required
            />
            {errors.interestRate && <span className="error">{errors.interestRate}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="loanTerm"
              value={newLoan.loanTerm}
              onChange={(e) => handleNumberChange(e, setNewLoan)}
              placeholder="Loan Term (months)"
              required
            />
            {errors.loanTerm && <span className="error">{errors.loanTerm}</span>}
          </div>

          <div className="form-group">
            <input
              type="date"
              name="repaymentStartDate"
              value={newLoan.repaymentStartDate}
              onChange={(e) => handleInputChange(e, setNewLoan)}
              placeholder="Repayment Start Date"
              required
            />
            {errors.repaymentStartDate && <span className="error">{errors.repaymentStartDate}</span>}
          </div>

          <div className="form-group">
            <select
              name="status"
              value={newLoan.status}
              onChange={(e) => handleInputChange(e, setNewLoan)}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit">Add Loan</button>
          </div>
        </form>
      )}

      {editLoan && (
        <form onSubmit={handleUpdateLoan} className="loan-form">
          <h3>Edit Loan</h3>
          
          <div className="form-group">
            <select
              name="borrower"
              value={editLoan.borrower?._id || editLoan.borrower}
              onChange={(e) => handleInputChange(e, setEditLoan)}
              required
            >
              <option value="">Select Borrower</option>
              {borrowers.map(borrower => (
                <option key={borrower._id} value={borrower._id}>
                  {borrower.name} ({borrower.email})
                </option>
              ))}
            </select>
            {errors.borrower && <span className="error">{errors.borrower}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="amount"
              value={editLoan.amount}
              onChange={(e) => handleNumberChange(e, setEditLoan)}
              placeholder="Loan Amount"
              required
            />
            {errors.amount && <span className="error">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="purpose"
              value={editLoan.purpose}
              onChange={(e) => handleInputChange(e, setEditLoan)}
              placeholder="Loan Purpose"
              required
            />
            {errors.purpose && <span className="error">{errors.purpose}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="interestRate"
              value={editLoan.interestRate}
              onChange={(e) => handleNumberChange(e, setEditLoan)}
              placeholder="Interest Rate (%)"
              required
            />
            {errors.interestRate && <span className="error">{errors.interestRate}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="loanTerm"
              value={editLoan.loanTerm}
              onChange={(e) => handleNumberChange(e, setEditLoan)}
              placeholder="Loan Term (months)"
              required
            />
            {errors.loanTerm && <span className="error">{errors.loanTerm}</span>}
          </div>

          <div className="form-group">
            <input
              type="date"
              name="repaymentStartDate"
              value={editLoan.repaymentStartDate}
              onChange={(e) => handleInputChange(e, setEditLoan)}
              placeholder="Repayment Start Date"
              required
            />
            {errors.repaymentStartDate && <span className="error">{errors.repaymentStartDate}</span>}
          </div>

          <div className="form-group">
            <select
              name="status"
              value={editLoan.status}
              onChange={(e) => handleInputChange(e, setEditLoan)}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <select
              name="repaymentStatus"
              value={editLoan.repaymentStatus}
              onChange={(e) => handleInputChange(e, setEditLoan)}
              required
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit">Update Loan</button>
            <button type="button" onClick={() => setEditLoan(null)}>Cancel</button>
          </div>
        </form>
      )}

      {loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        <div className="loans-table-container">
          <table className="loans-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Interest Rate</th>
                <th>Term</th>
                <th>Status</th>
                <th>Repayment</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedLoans.map(loan => (
                <tr key={loan._id}>
                  <td>
                    {loan.borrower?.name || 'Unknown Borrower'}
                    <button 
                      onClick={() => viewBorrower(loan.borrower?._id)}
                      className="icon-button"
                    >
                      <FaUser title="View Borrower" />
                    </button>
                  </td>
                  <td>${loan.amount?.toLocaleString()}</td>
                  <td>{loan.purpose}</td>
                  <td>{loan.interestRate}%</td>
                  <td>{loan.loanTerm} months</td>
                  <td className={`status-${loan.status.toLowerCase()}`}>
                    {loan.status}
                  </td>
                  <td className={`repayment-${loan.repaymentStatus.toLowerCase().replace(' ', '-')}`}>
                    {loan.repaymentStatus}
                  </td>
                  <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => setEditLoan(loan)}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteLoan(loan._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loans.length > displayLimit && (
            <button 
              className="show-toggle-button"
              onClick={() => setShowAllLoans(!showAllLoans)}
            >
              {showAllLoans ? (
                <>
                  <FaChevronUp />
                  Show Less (First {displayLimit})
                </>
              ) : (
                <>
                  <FaChevronDown />
                  Show All ({loans.length} loans)
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Loans;