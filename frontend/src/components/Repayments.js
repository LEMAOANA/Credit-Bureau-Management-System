import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Repayments.css';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Repayments = () => {
  const initialRepaymentState = () => ({
    borrower: '',
    paymentAmount: '',
    paymentDate: new Date(),
    paymentType: 'Cash',
    loan: ''
  });

  const [repayments, setRepayments] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRepayment, setNewRepayment] = useState(initialRepaymentState());
  const [editRepayment, setEditRepayment] = useState(null);
  const [showAddRepaymentForm, setShowAddRepaymentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRepayments();
    fetchBorrowers();
    fetchLoans();
  }, []);

  useEffect(() => {
    if (newRepayment.borrower) {
      const borrowerLoans = loans.filter(loan => loan.borrower._id === newRepayment.borrower);
      setFilteredLoans(borrowerLoans);
    } else {
      setFilteredLoans([]);
    }
  }, [newRepayment.borrower, loans]);

  const fetchRepayments = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/repayments');
      if (res.data.success) {
        setRepayments(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching repayments:", err);
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
      console.error("Error fetching borrowers:", err);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/loans');
      if (res.data.success) {
        setLoans(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching loans:", err);
    }
  };

  const handleInputChange = (e, stateSetter) => {
    const { name, value } = e.target;
    stateSetter(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, stateSetter, fieldName) => {
    stateSetter(prev => ({ ...prev, [fieldName]: date }));
  };

  const handleAddRepayment = async (e) => {
    e.preventDefault();
    
    try {
      const repaymentData = {
        ...newRepayment,
        paymentDate: newRepayment.paymentDate.toISOString()
      };

      const res = await axios.post('http://localhost:5001/api/repayments', repaymentData);
      if (res.data.success) {
        setRepayments([...repayments, res.data.data]);
        setNewRepayment(initialRepaymentState());
        setShowAddRepaymentForm(false);
        alert("Repayment recorded successfully!");
      } else {
        alert("Failed to add repayment: " + res.data.error);
      }
    } catch (err) {
      console.error("Error adding repayment:", err);
      alert("There was an error adding the repayment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateRepayment = async (e) => {
    e.preventDefault();
    try {
      const repaymentData = {
        ...editRepayment,
        paymentDate: editRepayment.paymentDate.toISOString()
      };

      const res = await axios.put(`http://localhost:5001/api/repayments/${editRepayment._id}`, repaymentData);
      if (res.data.success) {
        setRepayments(repayments.map(repayment => 
          repayment._id === editRepayment._id ? res.data.data : repayment
        ));
        setEditRepayment(null);
        alert("Repayment updated successfully!");
      } else {
        alert("Failed to update repayment: " + res.data.error);
      }
    } catch (error) {
      console.error("Error updating repayment:", error);
      alert("There was an error updating the repayment.");
    }
  };

  const handleDeleteRepayment = async (repaymentId) => {
    if (!window.confirm("Are you sure you want to delete this repayment record?")) return;

    try {
      const res = await axios.delete(`http://localhost:5001/api/repayments/${repaymentId}`);
      if (res.data.success) {
        setRepayments(repayments.filter(repayment => repayment._id !== repaymentId));
      }
    } catch (err) {
      console.error("Error deleting repayment:", err);
      alert("Error deleting repayment: " + (err.response?.data?.message || err.message));
    }
  };

  const viewBorrower = (borrowerId) => {
    console.log("View borrower:", borrowerId);
    alert("This would navigate to the borrower details page");
  };

  const viewLoan = (loanId) => {
    console.log("View loan:", loanId);
    alert("This would navigate to the loan details page");
  };

  const filteredRepayments = repayments.filter(repayment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      repayment.borrower?.name?.toLowerCase().includes(searchLower) ||
      repayment.loan?.purpose?.toLowerCase().includes(searchLower) ||
      repayment.paymentType.toLowerCase().includes(searchLower) ||
      repayment.paymentAmount.toString().includes(searchTerm) ||
      new Date(repayment.paymentDate).toLocaleDateString().includes(searchTerm)
    );
  });

  if (loading) return <p className="loading">Loading repayments...</p>;

  return (
    <div className="repayments-container">
      <h2>Repayment Management</h2>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search repayments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="add-repayment-toggle" onClick={() => setShowAddRepaymentForm(!showAddRepaymentForm)}>
        <FaPlus size={30} />
        <span>Add Repayment</span>
      </div>

      {/* Add Repayment Form */}
      {showAddRepaymentForm && (
        <form onSubmit={handleAddRepayment}>
          <h3>Record New Repayment</h3>
          
          <select
            name="borrower"
            value={newRepayment.borrower}
            onChange={(e) => handleInputChange(e, setNewRepayment)}
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
            value={newRepayment.loan}
            onChange={(e) => handleInputChange(e, setNewRepayment)}
            required
            disabled={!newRepayment.borrower}
          >
            <option value="">Select Loan</option>
            {filteredLoans.map(loan => (
              <option key={loan._id} value={loan._id}>
                ${loan.amount} - {loan.purpose} ({loan.status})
              </option>
            ))}
          </select>

          <input
            type="number"
            name="paymentAmount"
            value={newRepayment.paymentAmount}
            onChange={(e) => handleInputChange(e, setNewRepayment)}
            placeholder="Payment Amount"
            min="1"
            step="0.01"
            required
          />

          <div className="date-picker-container">
            <label>Payment Date:</label>
            <DatePicker
              selected={newRepayment.paymentDate}
              onChange={(date) => handleDateChange(date, setNewRepayment, 'paymentDate')}
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>

          <select
            name="paymentType"
            value={newRepayment.paymentType}
            onChange={(e) => handleInputChange(e, setNewRepayment)}
            required
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
            <option value="Mobile Payment">Mobile Payment</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit">Record Repayment</button>
        </form>
      )}

      {/* Edit Repayment Form */}
      {editRepayment && (
        <form onSubmit={handleUpdateRepayment}>
          <h3>Edit Repayment</h3>
          
          <div className="form-field">
            <label>Borrower:</label>
            <p>{editRepayment.borrower?.name || 'Loading...'}</p>
          </div>

          <div className="form-field">
            <label>Loan:</label>
            <p>{editRepayment.loan?.purpose || 'Loading...'} (${editRepayment.loan?.amount})</p>
          </div>

          <input
            type="number"
            name="paymentAmount"
            value={editRepayment.paymentAmount}
            onChange={(e) => handleInputChange(e, setEditRepayment)}
            min="1"
            step="0.01"
            required
          />

          <div className="date-picker-container">
            <label>Payment Date:</label>
            <DatePicker
              selected={new Date(editRepayment.paymentDate)}
              onChange={(date) => handleDateChange(date, setEditRepayment, 'paymentDate')}
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>

          <select
            name="paymentType"
            value={editRepayment.paymentType}
            onChange={(e) => handleInputChange(e, setEditRepayment)}
            required
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
            <option value="Mobile Payment">Mobile Payment</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit">Update Repayment</button>
          <button type="button" onClick={() => setEditRepayment(null)}>Cancel</button>
        </form>
      )}

      {/* Repayments Table */}
      {filteredRepayments.length === 0 ? (
        <p>No repayments found{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
      ) : (
        <table className="repayments-table">
          <thead>
            <tr>
              <th>Borrower</th>
              <th>Loan</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Type</th>
              <th>Recorded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepayments.map(repayment => (
              <tr key={repayment._id}>
                <td>
                  {repayment.borrower?.name || 'Unknown Borrower'}
                  <button 
                    onClick={() => viewBorrower(repayment.borrower?._id)}
                    className="icon-button"
                  >
                    <FaUser title="View Borrower" />
                  </button>
                </td>
                <td>
                  {repayment.loan?.purpose || 'Unknown Loan'}
                  <button 
                    onClick={() => viewLoan(repayment.loan?._id)}
                    className="icon-button"
                  >
                    <FaMoneyBillWave title="View Loan" />
                  </button>
                </td>
                <td>${repayment.paymentAmount?.toLocaleString()}</td>
                <td>{new Date(repayment.paymentDate).toLocaleDateString()}</td>
                <td>{repayment.paymentType}</td>
                <td>{new Date(repayment.createdAt).toLocaleString()}</td>
                <td className="actions">
                  <button onClick={() => setEditRepayment(repayment)}>
                    <FaEdit title="Edit" />
                  </button>
                  <button onClick={() => handleDeleteRepayment(repayment._id)}>
                    <FaTrash title="Delete" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Repayments;