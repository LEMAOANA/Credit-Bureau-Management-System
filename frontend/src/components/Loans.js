import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Loans.css';
import { FaPlus, FaEdit, FaTrash, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLoan, setNewLoan] = useState(initialFormState());
  const [editingLoan, setEditingLoan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAllLoans, setShowAllLoans] = useState(false);
  const displayLimit = 10;

  function initialFormState() {
    return {
      borrower: '',
      amount: '',
      purpose: '',
      status: 'Pending',
      repaymentStatus: 'Not Started',
      interestRate: '',
      loanTerm: '',
      repaymentStartDate: ''
    };
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingLoan) {
      await updateLoan();
    } else {
      await addLoan();
    }
  };

  const addLoan = async () => {
    try {
      const payload = {
        borrower: newLoan.borrower,
        amount: Number(newLoan.amount),
        purpose: newLoan.purpose,
        interestRate: Number(newLoan.interestRate),
        loanTerm: Number(newLoan.loanTerm),
        repaymentStartDate: newLoan.repaymentStartDate,
        status: newLoan.status,
        repaymentStatus: newLoan.repaymentStatus
      };

      const response = await axios.post('http://localhost:5001/api/loans', payload);
      setLoans([response.data, ...loans]);
      resetForm();
      alert('Loan added successfully!');
    } catch (error) {
      console.error('Error adding loan:', error);
      alert(error?.response?.data?.message || 'Failed to add loan.');
    }
  };

  const updateLoan = async () => {
    try {
      const payload = {
        borrower: editingLoan.borrower,
        amount: Number(editingLoan.amount),
        purpose: editingLoan.purpose,
        interestRate: Number(editingLoan.interestRate),
        loanTerm: Number(editingLoan.loanTerm),
        repaymentStartDate: editingLoan.repaymentStartDate,
        status: editingLoan.status,
        repaymentStatus: editingLoan.repaymentStatus
      };

      const response = await axios.put(
        `http://localhost:5001/api/loans/${editingLoan._id}`,
        payload
      );
      
      setLoans(loans.map(loan => 
        loan._id === editingLoan._id ? response.data : loan
      ));
      resetForm();
      alert('Loan updated successfully!');
    } catch (error) {
      console.error('Error updating loan:', error);
      alert('Failed to update loan.');
    }
  };

  const resetForm = () => {
    setNewLoan(initialFormState());
    setEditingLoan(null);
    setShowForm(false);
  };

  const deleteLoan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) return;

    try {
      await axios.delete(`http://localhost:5001/api/loans/${id}`);
      setLoans(loans.filter(loan => loan._id !== id));
      alert('Loan deleted successfully');
    } catch (error) {
      console.error('Error deleting loan:', error);
      alert('Error deleting loan');
    }
  };

  const viewBorrower = (id) => {
    alert(`Viewing borrower details for ID: ${id}`);
  };

  const statusOptions = ['Pending', 'Approved', 'Rejected'];
  const repaymentStatusOptions = ['Not Started', 'In Progress', 'Completed'];

  const displayedLoans = showAllLoans ? loans : loans.slice(0, displayLimit);

  return (
    <div className="loans-container">
      <h2>Loan Management</h2>

      <div className="add-loan-toggle" onClick={() => setShowForm(!showForm)}>
        <FaPlus /> <span>{showForm ? 'Cancel' : 'Add Loan'}</span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="loan-form">
          <h3>{editingLoan ? 'Edit Loan' : 'Add Loan'}</h3>
          
          <div className="form-group">
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

          {['amount', 'purpose', 'interestRate', 'loanTerm'].map((field) => (
            <div className="form-group" key={field}>
              <input
                name={field}
                type={['amount', 'interestRate', 'loanTerm'].includes(field) ? 'number' : 'text'}
                value={editingLoan?.[field] ?? newLoan[field]}
                onChange={(e) => 
                  ['amount', 'interestRate', 'loanTerm'].includes(field) 
                    ? handleNumberChange(e, editingLoan ? setEditingLoan : setNewLoan)
                    : handleChange(e, editingLoan ? setEditingLoan : setNewLoan)
                }
                placeholder={
                  field.charAt(0).toUpperCase() + 
                  field.slice(1).replace(/([A-Z])/g, ' $1')
                }
                required
                min={['amount', 'interestRate', 'loanTerm'].includes(field) ? '1' : undefined}
              />
            </div>
          ))}

          <div className="form-group">
            <input
              name="repaymentStartDate"
              type="date"
              value={editingLoan?.repaymentStartDate ?? newLoan.repaymentStartDate}
              onChange={(e) => handleChange(e, editingLoan ? setEditingLoan : setNewLoan)}
              placeholder="Repayment Start Date"
              required
            />
          </div>

          <div className="form-group">
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

          {editingLoan && (
            <div className="form-group">
              <select
                name="repaymentStatus"
                value={editingLoan.repaymentStatus}
                onChange={(e) => handleChange(e, setEditingLoan)}
                required
              >
                {repaymentStatusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="submit">{editingLoan ? 'Update' : 'Add'} Loan</button>
            <button type="button" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="loading">Loading loans...</p>
      ) : loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        <div className="loans-table-container">
          <table className="loans-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Amount (M)</th> 
                <th>Purpose</th>
                <th>Interest</th>
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
                    {loan.borrower && (
                      <button 
                        onClick={() => viewBorrower(loan.borrower._id)}
                        className="icon-button"
                        aria-label="View Borrower"
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
                  <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => {
                        setEditingLoan(loan);
                        setShowForm(true);
                      }}
                      aria-label="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => deleteLoan(loan._id)}
                      aria-label="Delete"
                    >
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