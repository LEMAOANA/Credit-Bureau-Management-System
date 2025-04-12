import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Users.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const Users = () => {
  const initialUserState = () => ({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '', // Make sure to include this field
    role: 'user',
    isActive: true,
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState(initialUserState());
  const [editUser, setEditUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, stateSetter) => {
    const { name, value, type, checked } = e.target;
    stateSetter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    // Password and password confirmation validation
    if (newUser.password !== newUser.passwordConfirm) {
      return alert("Passwords do not match.");
    }

    if (newUser.password.length < 8) {
      return alert("Password must be at least 8 characters long.");
    }

    const { passwordConfirm, ...userData } = newUser;

    try {
      const res = await axios.post('http://localhost:5001/api/users', userData);
      if (res.data.success) {
        setUsers([...users, res.data.data]);
        setNewUser(initialUserState());
        setShowAddUserForm(false);
        alert("User added successfully!");
      } else {
        alert("Failed to add user: " + res.data.error);
      }
    } catch (err) {
      console.error("Error adding user:", err.response || err);
      alert("There was an error adding the user: " + (err.response ? err.response.data.error : err.message));
    }    
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5001/api/users/${editUser._id}`, editUser);
      if (res.data.success) {
        setUsers(users.map(user => user._id === editUser._id ? res.data.data : user));
        setEditUser(null); // Clear the edit form
        alert("User updated successfully!");
      } else {
        alert("Failed to update user: " + res.data.error);
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("There was an error updating the user.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await axios.delete(`http://localhost:5001/api/users/${userId}`);
      if (res.data.success) {
        setUsers(users.filter(user => user._id !== userId));
        alert("User deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("There was an error deleting the user.");
    }
  };

  if (loading) return <p className="loading">Loading users...</p>;

  return (
    <div className="users-container">
      <h2>User Management</h2>

      <div className="add-user-toggle" onClick={() => setShowAddUserForm(!showAddUserForm)}>
        <FaPlus size={20} />
        <span>Add User</span>
      </div>

      {showAddUserForm && (
        <form onSubmit={handleAddUser} className="user-form">
          <h3>Add New User</h3>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => handleInputChange(e, setNewUser)}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => handleInputChange(e, setNewUser)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 8 characters)"
            value={newUser.password}
            onChange={(e) => handleInputChange(e, setNewUser)}
            required
          />
          <input
            type="password"
            name="passwordConfirm"
            placeholder="Confirm Password"
            value={newUser.passwordConfirm}
            onChange={(e) => handleInputChange(e, setNewUser)}
            required
          />
          <select
            name="role"
            value={newUser.role}
            onChange={(e) => handleInputChange(e, setNewUser)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <label>
            Active
            <input
              type="checkbox"
              name="isActive"
              checked={newUser.isActive}
              onChange={(e) => handleInputChange(e, setNewUser)}
            />
          </label>
          <button type="submit">Add User</button>
        </form>
      )}

      {editUser && (
        <form onSubmit={handleUpdateUser} className="user-form">
          <h3>Edit User</h3>
          <input
            type="text"
            name="username"
            value={editUser.username}
            onChange={(e) => handleInputChange(e, setEditUser)}
            required
          />
          <input
            type="email"
            name="email"
            value={editUser.email}
            onChange={(e) => handleInputChange(e, setEditUser)}
            required
          />
          <select
            name="role"
            value={editUser.role}
            onChange={(e) => handleInputChange(e, setEditUser)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <label>
            Active
            <input
              type="checkbox"
              name="isActive"
              checked={editUser.isActive}
              onChange={(e) => handleInputChange(e, setEditUser)}
            />
          </label>
          <button type="submit">Update User</button>
          <button type="button" onClick={() => setEditUser(null)}>Cancel</button>
        </form>
      )}

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => setEditUser(user)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteUser(user._id)}>
                    <FaTrash />
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

export default Users;
