import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Borrowers.css';
import { FaPlus, FaEdit, FaTrash, FaFileAlt } from 'react-icons/fa';

const Borrowers = () => {
  const initialBorrowerState = () => ({
    name: '',
    email: '',
    phone: '',
    loanAmount: '',
    loanPurpose: '',
    nationalId: ''
  });

  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBorrower, setNewBorrower] = useState(initialBorrowerState());
  const [editBorrower, setEditBorrower] = useState(null);
  const [showAddBorrowerForm, setShowAddBorrowerForm] = useState(false);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/borrowers');
      if (res.data.success) {
        setBorrowers(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching borrowers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, stateSetter) => {
    const { name, value } = e.target;
    stateSetter(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBorrower = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post('http://localhost:5001/api/borrowers', newBorrower);
      if (res.data.success) {
        setBorrowers([...borrowers, res.data.data]);
        setNewBorrower(initialBorrowerState());
        setShowAddBorrowerForm(false);
        alert("Borrower added successfully!");
      } else {
        alert("Failed to add borrower: " + res.data.error);
      }
    } catch (err) {
      console.error("Error adding borrower:", err);
      alert("There was an error adding the borrower: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateBorrower = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5001/api/borrowers/${editBorrower._id}`, editBorrower);
      if (res.data.success) {
        setBorrowers(borrowers.map(borrower => 
          borrower._id === editBorrower._id ? res.data.data : borrower
        ));
        setEditBorrower(null);
        alert("Borrower updated successfully!");
      } else {
        alert("Failed to update borrower: " + res.data.error);
      }
    } catch (error) {
      console.error("Error updating borrower:", error);
      alert("There was an error updating the borrower.");
    }
  };

  const handleDeleteBorrower = async (borrowerId) => {
    if (!window.confirm("Are you sure you want to delete this borrower and their associated loans?")) return;

    try {
      const res = await axios.delete(`http://localhost:5001/api/borrowers/${borrowerId}`);
      if (res.data.success) {
        setBorrowers(borrowers.filter(borrower => borrower._id !== borrowerId));
      }
    } catch (err) {
      console.error("Error deleting borrower:", err);
      alert("Error deleting borrower: " + (err.response?.data?.message || err.message));
    }
  };

  const viewLoans = (borrowerId) => {
    // You would implement navigation to the loans page filtered by this borrower
    console.log("View loans for borrower:", borrowerId);
    alert("This would navigate to the loans page for this borrower");
  };

  if (loading) return <p className="loading">Loading borrowers...</p>;

  return (
    <div className="borrowers-container">
      <h2>Borrower Management</h2>

      <div className="add-borrower-toggle" onClick={() => setShowAddBorrowerForm(!showAddBorrowerForm)}>
        <FaPlus size={30} />
        <span>Add Borrower</span>
      </div>

      {/* Add Borrower Form */}
      {showAddBorrowerForm && (
        <form onSubmit={handleAddBorrower}>
          <h3>Add Borrower</h3>
          <input type="text" name="name" value={newBorrower.name} 
            onChange={(e) => handleInputChange(e, setNewBorrower)} 
            placeholder="Full Name" required 
          />
          <input type="email" name="email" value={newBorrower.email} 
            onChange={(e) => handleInputChange(e, setNewBorrower)} 
            placeholder="Email" required 
          />
          <input type="tel" name="phone" value={newBorrower.phone} 
            onChange={(e) => handleInputChange(e, setNewBorrower)} 
            placeholder="Phone Number" required 
          />
          <input type="number" name="loanAmount" value={newBorrower.loanAmount} 
            onChange={(e) => handleInputChange(e, setNewBorrower)} 
            placeholder="Loan Amount" min="100" required 
          />
          <input type="text" name="loanPurpose" value={newBorrower.loanPurpose} 
            onChange={(e) => handleInputChange(e, setNewBorrower)} 
            placeholder="Loan Purpose" required 
          />
          <input type="text" name="nationalId" value={newBorrower.nationalId} 
            onChange={(e) => handleInputChange(e, setNewBorrower)} 
            placeholder="National ID (Optional)" 
          />
          <button type="submit">Add Borrower</button>
        </form>
      )}

      {/* Edit Borrower Form */}
      {editBorrower && (
        <form onSubmit={handleUpdateBorrower}>
          <h3>Edit Borrower</h3>
          <input type="text" name="name" value={editBorrower.name} 
            onChange={(e) => handleInputChange(e, setEditBorrower)} required 
          />
          <input type="email" name="email" value={editBorrower.email} 
            onChange={(e) => handleInputChange(e, setEditBorrower)} required 
          />
          <input type="tel" name="phone" value={editBorrower.phone} 
            onChange={(e) => handleInputChange(e, setEditBorrower)} required 
          />
          <input type="number" name="loanAmount" value={editBorrower.loanAmount} 
            onChange={(e) => handleInputChange(e, setEditBorrower)} min="100" required 
          />
          <input type="text" name="loanPurpose" value={editBorrower.loanPurpose} 
            onChange={(e) => handleInputChange(e, setEditBorrower)} required 
          />
          <input type="text" name="nationalId" value={editBorrower.nationalId} 
            onChange={(e) => handleInputChange(e, setEditBorrower)} 
            placeholder="National ID" 
          />
          <button type="submit">Update Borrower</button>
          <button type="button" onClick={() => setEditBorrower(null)}>Cancel</button>
        </form>
      )}

      {/* Borrowers Table */}
      {borrowers.length === 0 ? (
        <p>No borrowers found.</p>
      ) : (
        <table className="borrowers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Loan Amount</th>
              <th>Loan Purpose</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {borrowers.map(borrower => (
              <tr key={borrower._id}>
                <td>{borrower.name}</td>
                <td>{borrower.email}</td>
                <td>{borrower.phone}</td>
                <td>${borrower.loanAmount?.toLocaleString()}</td>
                <td>{borrower.loanPurpose}</td>
                <td>{new Date(borrower.createdAt).toLocaleString()}</td>
                <td className="actions">
                  <button onClick={() => setEditBorrower(borrower)}>
                    <FaEdit title="Edit" />
                  </button>
                  <button onClick={() => handleDeleteBorrower(borrower._id)}>
                    <FaTrash title="Delete" />
                  </button>
                  <button onClick={() => viewLoans(borrower._id)}>
                    <FaFileAlt title="View Loans" />
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

export default Borrowers;