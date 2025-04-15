import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Users.css';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Users = () => {
  // Initial user state
  const initialUserState = {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'user',
    isActive: true,
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState(initialUserState);
  const [editUser, setEditUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const displayLimit = 10;

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/users');
      if (res.data.success) {
        // Sort users by createdAt date (newest first)
        const sortedUsers = res.data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUsers(sortedUsers);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for both add and edit user forms
  const handleInputChange = (e, setter) => {
    const { name, value, type, checked } = e.target;
    setter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Add new user
  const handleSubmit = async (event) => {
    event.preventDefault();

    const { username, email, password, passwordConfirm } = newUser;

    // Check if passwords match before proceeding
    if (password !== passwordConfirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/users", {
        username,
        email,
        password,
        passwordConfirm,
        role: "user",
        isActive: true,
      });
      console.log("User added:", response.data);
      fetchUsers(); // Refresh the user list after adding
      setShowAddUserForm(false); // Hide the form after submission
      setNewUser(initialUserState); // Reset form
    } catch (error) {
      console.error("Error adding user:", error.response ? error.response.data : error.message);
      alert("Error adding user.");
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(`http://localhost:5001/api/users/${editUser._id}`, editUser, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data.success) {
        setUsers(users.map(user => user._id === editUser._id ? res.data.data : user));
        setEditUser(null);
        alert("User updated successfully!");
      } else {
        alert("Failed to update user: " + res.data.error);
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error updating user.");
    }
  };

  // Delete user
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
      alert("Error deleting user.");
    }
  };

  // Loading state
  if (loading) return <p className="loading">Loading users...</p>;

  // Determine which users to display based on showAllUsers state
  const displayedUsers = showAllUsers ? users : users.slice(0, displayLimit);

  return (
    <div className="users-container">
      <h2>User Management</h2>

      <div className="add-user-toggle" onClick={() => setShowAddUserForm(!showAddUserForm)}>
        <FaPlus size={20} />
        <span>Add User</span>
      </div>

      {showAddUserForm && (
        <form onSubmit={handleSubmit} className="user-form">
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
        <div className="users-table-container">
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
              {displayedUsers.map(user => (
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
          
          {users.length > displayLimit && (
            <button 
              className="show-toggle-button"
              onClick={() => setShowAllUsers(!showAllUsers)}
            >
              {showAllUsers ? (
                <>
                  <FaChevronUp />
                  Show Less (First {displayLimit})
                </>
              ) : (
                <>
                  <FaChevronDown />
                  Show All ({users.length} users)
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;