import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Borrowers.css';
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Borrowers = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBorrower, setNewBorrower] = useState(initialFormState());
  const [editingBorrower, setEditingBorrower] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAllBorrowers, setShowAllBorrowers] = useState(false);
  const displayLimit = 10;

  function initialFormState() {
    return {
      name: '',
      email: '',
      phone: '',
      loanAmount: '',
      loanPurpose: '',
      nationalId: '',
      repaymentStartDate: '',
      loanTerm: '',
      interestRate: ''
    };
  }

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/borrowers');
      if (response.data.success) {
        const sortedBorrowers = response.data.data.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBorrowers(sortedBorrowers);
      }
    } catch (error) {
      console.error('Error fetching borrowers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingBorrower) {
      await updateBorrower();
    } else {
      await addBorrower();
    }
  };

  const addBorrower = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/borrowers', newBorrower);
      if (response.data.success) {
        setBorrowers([response.data.data, ...borrowers]);
        resetForm();
        alert('Borrower added successfully!');
      }
    } catch (error) {
      console.error('Error adding borrower:', error);
      alert(error?.response?.data?.message || 'Failed to add borrower.');
    }
  };

  const updateBorrower = async () => {
    try {
      const response = await axios.put(`http://localhost:5001/api/borrowers/${editingBorrower._id}`, editingBorrower);
      if (response.data.success) {
        setBorrowers(borrowers.map(b => b._id === editingBorrower._id ? response.data.data : b));
        resetForm();
        alert('Borrower updated successfully!');
      }
    } catch (error) {
      console.error('Error updating borrower:', error);
      alert('Failed to update borrower.');
    }
  };

  const resetForm = () => {
    setNewBorrower(initialFormState());
    setEditingBorrower(null);
    setShowForm(false);
  };

  const deleteBorrower = async (id) => {
    if (!window.confirm('Delete this borrower and all their data?')) return;

    try {
      const response = await axios.delete(`http://localhost:5001/api/borrowers/${id}`);
      if (response.data.success) {
        setBorrowers(borrowers.filter(b => b._id !== id));
      }
    } catch (error) {
      console.error('Error deleting borrower:', error);
    }
  };

  const viewLoans = (id) => {
    alert(`Redirecting to loans for borrower ID: ${id}`);
  };

  const displayedBorrowers = showAllBorrowers ? borrowers : borrowers.slice(0, displayLimit);

  return (
    <div className="borrowers-container">
      <h2>Borrower Management</h2>

      <div className="add-borrower-toggle" onClick={() => setShowForm(!showForm)}>
        <FaPlus /> <span>{showForm ? 'Cancel' : 'Add Borrower'}</span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="borrower-form">
          <h3>{editingBorrower ? 'Edit Borrower' : 'Add Borrower'}</h3>
          {['name', 'email', 'phone', 'loanPurpose', 'nationalId'].map((field) => (
            <input
              key={field}
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              value={editingBorrower ? editingBorrower[field] : newBorrower[field]}
              onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              required={field !== 'nationalId'}
            />
          ))}
          <input
            name="loanAmount"
            type="number"
            value={editingBorrower ? editingBorrower.loanAmount : newBorrower.loanAmount}
            onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
            placeholder="Loan Amount (M)"
            required
            min="100"
          />
          <input
            name="repaymentStartDate"
            type="date"
            value={editingBorrower ? editingBorrower.repaymentStartDate : newBorrower.repaymentStartDate}
            onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
            placeholder="Repayment Start Date"
            required
          />
          <input
            name="loanTerm"
            type="number"
            value={editingBorrower ? editingBorrower.loanTerm : newBorrower.loanTerm}
            onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
            placeholder="Loan Term (months)"
            required
            min="1"
          />
          <input
            name="interestRate"
            type="number"
            value={editingBorrower ? editingBorrower.interestRate : newBorrower.interestRate}
            onChange={(e) => handleChange(e, editingBorrower ? setEditingBorrower : setNewBorrower)}
            placeholder="Interest Rate (%)"
            required
            min="0"
          />
          <div className="form-actions">
            <button type="submit">{editingBorrower ? 'Update' : 'Add'} Borrower</button>
            {editingBorrower && <button type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      )}

      {loading ? (
        <p className="loading">Loading borrowers...</p>
      ) : borrowers.length === 0 ? (
        <p>No borrowers found.</p>
      ) : (
        <div className="borrowers-table-container">
          <table className="borrowers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Loan (M)</th>
                <th>Purpose</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedBorrowers.map((b) => (
                <tr key={b._id}>
                  <td>{b.name}</td>
                  <td>{b.email}</td>
                  <td>{b.phone}</td>
                  <td>M{b.loanAmount?.toLocaleString()}</td>
                  <td>{b.loanPurpose}</td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => { setEditingBorrower(b); setShowForm(true); }}><FaEdit title="Edit" /></button>
                    <button onClick={() => deleteBorrower(b._id)}><FaTrash title="Delete" /></button>
                    <button onClick={() => viewLoans(b._id)}><FaFileAlt title="View Loans" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {borrowers.length > displayLimit && (
            <button
              className="show-toggle-button"
              onClick={() => setShowAllBorrowers(!showAllBorrowers)}
            >
              {showAllBorrowers ? (
                <>
                  <FaChevronUp />
                  Show Less (First {displayLimit})
                </>
              ) : (
                <>
                  <FaChevronDown />
                  Show All ({borrowers.length} borrowers)
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Borrowers;
