import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Loans.css';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser } from 'react-icons/fa';

const Loans = () => {
  const initialLoanState = () => ({
    borrower: '',
    amount: '',
    purpose: '',
    status: 'Pending',
    repaymentStatus: 'Not Started'
  });

  const [loans, setLoans] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLoan, setNewLoan] = useState(initialLoanState());
  const [editLoan, setEditLoan] = useState(null);
  const [showAddLoanForm, setShowAddLoanForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLoans();
    fetchBorrowers();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/loans');
      if (res.data.success) {
        setLoans(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching loans:", err);
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

  const handleInputChange = (e, stateSetter) => {
    const { name, value } = e.target;
    stateSetter(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLoan = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post('http://localhost:5001/api/loans', newLoan);
      if (res.data.success) {
        setLoans([...loans, res.data.data]);
        setNewLoan(initialLoanState());
        setShowAddLoanForm(false);
        alert("Loan added successfully!");
      } else {
        alert("Failed to add loan: " + res.data.error);
      }
    } catch (err) {
      console.error("Error adding loan:", err);
      alert("There was an error adding the loan: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateLoan = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5001/api/loans/${editLoan._id}`, editLoan);
      if (res.data.success) {
        setLoans(loans.map(loan => 
          loan._id === editLoan._id ? res.data.data : loan
        ));
        setEditLoan(null);
        alert("Loan updated successfully!");
      } else {
        alert("Failed to update loan: " + res.data.error);
      }
    } catch (error) {
      console.error("Error updating loan:", error);
      alert("There was an error updating the loan.");
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (!window.confirm("Are you sure you want to delete this loan?")) return;

    try {
      const res = await axios.delete(`http://localhost:5001/api/loans/${loanId}`);
      if (res.data.success) {
        setLoans(loans.filter(loan => loan._id !== loanId));
      }
    } catch (err) {
      console.error("Error deleting loan:", err);
      alert("Error deleting loan: " + (err.response?.data?.message || err.message));
    }
  };

  const viewBorrower = (borrowerId) => {
    // Implement navigation to borrower details
    console.log("View borrower:", borrowerId);
    alert("This would navigate to the borrower details page");
  };

  const filteredLoans = loans.filter(loan => {
    const searchLower = searchTerm.toLowerCase();
    return (
      loan.borrower?.name?.toLowerCase().includes(searchLower) ||
      loan.purpose.toLowerCase().includes(searchLower) ||
      loan.status.toLowerCase().includes(searchLower) ||
      loan.repaymentStatus.toLowerCase().includes(searchLower) ||
      loan.amount.toString().includes(searchTerm)
    );
  });

  if (loading) return <p className="loading">Loading loans...</p>;

  return (
    <div className="loans-container">
      <h2>Loan Management</h2>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search loans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="add-loan-toggle" onClick={() => setShowAddLoanForm(!showAddLoanForm)}>
        <FaPlus size={30} />
        <span>Add Loan</span>
      </div>

      {/* Add Loan Form */}
      {showAddLoanForm && (
        <form onSubmit={handleAddLoan}>
          <h3>Add Loan</h3>
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
          <input
            type="number"
            name="amount"
            value={newLoan.amount}
            onChange={(e) => handleInputChange(e, setNewLoan)}
            placeholder="Loan Amount"
            min="100"
            required
          />
          <input
            type="text"
            name="purpose"
            value={newLoan.purpose}
            onChange={(e) => handleInputChange(e, setNewLoan)}
            placeholder="Loan Purpose"
            required
          />
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
          <button type="submit">Add Loan</button>
        </form>
      )}

      {/* Edit Loan Form */}
      {editLoan && (
        <form onSubmit={handleUpdateLoan}>
          <h3>Edit Loan</h3>
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
          <input
            type="number"
            name="amount"
            value={editLoan.amount}
            onChange={(e) => handleInputChange(e, setEditLoan)}
            min="100"
            required
          />
          <input
            type="text"
            name="purpose"
            value={editLoan.purpose}
            onChange={(e) => handleInputChange(e, setEditLoan)}
            required
          />
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
          <button type="submit">Update Loan</button>
          <button type="button" onClick={() => setEditLoan(null)}>Cancel</button>
        </form>
      )}

      {/* Loans Table */}
      {filteredLoans.length === 0 ? (
        <p>No loans found{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
      ) : (
        <table className="loans-table">
          <thead>
            <tr>
              <th>Borrower</th>
              <th>Amount</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Repayment</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map(loan => (
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
                <td className={`status-${loan.status.toLowerCase()}`}>
                  {loan.status}
                </td>
                <td className={`repayment-${loan.repaymentStatus.toLowerCase().replace(' ', '-')}`}>
                  {loan.repaymentStatus}
                </td>
                <td>{new Date(loan.createdAt).toLocaleString()}</td>
                <td className="actions">
                  <button onClick={() => setEditLoan(loan)}>
                    <FaEdit title="Edit" />
                  </button>
                  <button onClick={() => handleDeleteLoan(loan._id)}>
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

export default Loans;