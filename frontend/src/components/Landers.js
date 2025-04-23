import React, { useEffect, useState, useMemo } from 'react';
import { FaFileExport } from 'react-icons/fa';
import axios from 'axios';
import './Landers.css';
import { 
  FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, 
  FaSearch, FaSync, FaFilter, FaTimes, FaSort, FaSortUp, FaSortDown 
} from 'react-icons/fa';

const Landers = () => {
  // Initial user state
  const initialUserState = {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'user',
    isActive: true,
  };

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState(initialUserState);
  const [editUser, setEditUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const usersPerPage = 10;
  const [notification, setNotification] = useState(null);

  // Simple notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsRefreshing(true);
      const res = await axios.get('http://localhost:5001/api/users');
      if (res.data.success) {
        const sortedUsers = res.data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUsers(sortedUsers);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      showNotification("Failed to fetch users", 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters, search and sorting
  const processedUsers = useMemo(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Apply role filter
    if (filters.role !== 'all') {
      result = result.filter(user => user.role === filters.role);
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      const statusFilter = filters.status === 'active';
      result = result.filter(user => user.isActive === statusFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [users, searchTerm, filters, sortConfig]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = processedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(processedUsers.length / usersPerPage);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Get sort icon for table headers
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Handle input changes
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

    // Validation
    if (password !== passwordConfirm) {
      showNotification("Passwords do not match!", 'error');
      return;
    }

    if (password.length < 8) {
      showNotification("Password must be at least 8 characters long", 'error');
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/users", {
        username,
        email,
        password,
        passwordConfirm,
        role: newUser.role,
        isActive: newUser.isActive,
      });
      
      showNotification("User added successfully!");
      fetchUsers();
      setShowAddUserForm(false);
      setNewUser(initialUserState);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error adding user";
      showNotification(errorMsg, 'error');
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `http://localhost:5001/api/users/${editUser._id}`, 
        editUser,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data.success) {
        showNotification("User updated successfully!");
        fetchUsers();
        setEditUser(null);
      } else {
        showNotification("Failed to update user: " + res.data.error, 'error');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error updating user";
      showNotification(errorMsg, 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await axios.delete(`http://localhost:5001/api/users/${userId}`);
      if (res.data.success) {
        showNotification("User deleted successfully!");
        fetchUsers();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error deleting user";
      showNotification(errorMsg, 'error');
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await axios.patch(
        `http://localhost:5001/api/users/${userId}/status`,
        { isActive: !currentStatus }
      );
      
      if (res.data.success) {
        showNotification(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchUsers();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error updating user status";
      showNotification(errorMsg, 'error');
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      role: 'all',
      status: 'all'
    });
    setCurrentPage(1);
  };

  // Loading state
  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading users...</p>
    </div>
  );
  // Add this function inside your component (before the return statement)
const exportToCSV = () => {
  // Prepare CSV content
  const headers = ['Username', 'Email', 'Role', 'Status', 'Created At'];
  const rows = processedUsers.map(user => [
    user.username,
    user.email,
    user.role,
    user.isActive ? 'Active' : 'Inactive',
    new Date(user.createdAt).toLocaleString()
  ]);

  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(',') + "\n" 
    + rows.map(row => row.join(',')).join("\n");

  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "users_export.csv");
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  document.body.removeChild(link);
  
  showNotification("CSV exported successfully!");
};

  // Calculate user stats
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;

  return (
    <div className="users-container">
      {/* Notification system */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="users-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={fetchUsers}
            disabled={isRefreshing}
          >
            <FaSync className={isRefreshing ? 'spinning' : ''} />
          </button>
          <button 
            className="add-user-btn"
            onClick={() => setShowAddUserForm(!showAddUserForm)}
          >
            <FaPlus />
            <span>Add User</span>
          </button>
          {/* Add this button to your header-actions div (near the refresh and add user buttons)*/}
          <button
            className="export-btn"
              onClick={exportToCSV}
                disabled={processedUsers.length === 0}>
                <FaFileExport />
                <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{activeUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Inactive Users</h3>
          <p>{totalUsers - activeUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Admin Users</h3>
          <p>{adminUsers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <FaTimes 
              className="clear-search" 
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            />
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>
              <FaFilter className="filter-icon" />
              Role:
            </label>
            <select
              value={filters.role}
              onChange={(e) => {
                setFilters({...filters, role: e.target.value});
                setCurrentPage(1);
              }}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaFilter className="filter-icon" />
              Status:
            </label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({...filters, status: e.target.value});
                setCurrentPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button 
            className="reset-filters"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Add User Form */}
      {showAddUserForm && (
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-header">
            <h3>Add New User</h3>
            <button 
              type="button" 
              className="close-form"
              onClick={() => {
                setShowAddUserForm(false);
                setNewUser(initialUserState);
              }}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => handleInputChange(e, setNewUser)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => handleInputChange(e, setNewUser)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password (min 8 characters)"
                value={newUser.password}
                onChange={(e) => handleInputChange(e, setNewUser)}
                required
                minLength="8"
              />
            </div>
            
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="passwordConfirm"
                placeholder="Confirm Password"
                value={newUser.passwordConfirm}
                onChange={(e) => handleInputChange(e, setNewUser)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={(e) => handleInputChange(e, setNewUser)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newUser.isActive}
                  onChange={(e) => handleInputChange(e, setNewUser)}
                />
                <span>Active</span>
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Add User
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                setShowAddUserForm(false);
                setNewUser(initialUserState);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Edit User Form */}
      {editUser && (
        <form onSubmit={handleUpdateUser} className="user-form">
          <div className="form-header">
            <h3>Edit User</h3>
            <button 
              type="button" 
              className="close-form"
              onClick={() => setEditUser(null)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={editUser.username}
                onChange={(e) => handleInputChange(e, setEditUser)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editUser.email}
                onChange={(e) => handleInputChange(e, setEditUser)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={editUser.role}
                onChange={(e) => handleInputChange(e, setEditUser)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={editUser.isActive}
                  onChange={(e) => handleInputChange(e, setEditUser)}
                />
                <span>Active</span>
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Update User
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => setEditUser(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('username')}>
                <div className="sortable-header">
                  Username {getSortIcon('username')}
                </div>
              </th>
              <th onClick={() => requestSort('email')}>
                <div className="sortable-header">
                  Email {getSortIcon('email')}
                </div>
              </th>
              <th onClick={() => requestSort('role')}>
                <div className="sortable-header">
                  Role {getSortIcon('role')}
                </div>
              </th>
              <th onClick={() => requestSort('isActive')}>
                <div className="sortable-header">
                  Status {getSortIcon('isActive')}
                </div>
              </th>
              <th onClick={() => requestSort('createdAt')}>
                <div className="sortable-header">
                  Created At {getSortIcon('createdAt')}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button 
                      className={`status-btn ${user.isActive ? '' : 'inactive'}`}
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => setEditUser(user)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  No users found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {processedUsers.length > usersPerPage && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={currentPage === number ? 'active' : ''}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Landers;