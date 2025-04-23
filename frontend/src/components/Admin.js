import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaCoins } from 'react-icons/fa';
import {
  Home as HomeIcon,
  Users,
  CreditCard,
  FileText,
  LogOut,
  UserCircle,
  ChevronDown,
  Settings,
  Eye,
  Bell,
  Search
} from 'lucide-react';
import './Admin.css';

const AdminHome = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Replace with actual API call
        const mockNotifications = [
          { id: 1, message: 'New loan application received', time: '2 hours ago', unread: true },
          { id: 2, message: 'Payment received from John Doe', time: '1 day ago', unread: true },
          { id: 3, message: 'System maintenance scheduled', time: '3 days ago', unread: false },
        ];
        setNotifications(mockNotifications);
        setUnreadNotifications(mockNotifications.filter(n => n.unread).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewSite = () => {
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const markNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    setUnreadNotifications(0);
  };

  // User information utilities
  const getUserDisplay = () => {
    if (!currentUser) return { name: 'Guest', role: 'guest' };

    const username = (
      currentUser.username ||
      currentUser.displayName ||
      currentUser.name ||
      currentUser.fullName ||
      currentUser.user?.name ||
      currentUser.user?.username ||
      currentUser.profile?.username ||
      currentUser.email?.split('@')[0] ||
      'User'
    );

    const role = (
      currentUser?.role ||
      currentUser?.user?.role ||
      currentUser?.claims?.role ||
      'user'
    );

    return { name: username, role };
  };

  const userDisplay = getUserDisplay();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Credit Bureau</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <ul>
              <NavLink to="/Admin" end className="nav-link">
                <HomeIcon size={20} className="nav-icon" />
                <span>Dashboard</span>
              </NavLink>
            </ul>
            <ul>
              <NavLink to="/Admin/landers" className="nav-link">
                <Users size={20} className="nav-icon" />
                <span>Landers</span>
              </NavLink>
            </ul>
            <ul>
              <NavLink to="/Admin/borrowers" className="nav-link">
                <Users size={20} className="nav-icon" />
                <span>Borrowers</span>
              </NavLink>
            </ul>
            <ul>
              <NavLink to="/Admin/loans" className="nav-link">
                <CreditCard size={20} className="nav-icon" />
                <span>Loans</span>
              </NavLink>
            </ul>
            <ul>
              <NavLink to="/Admin/repayments" className="nav-link">
              <FaCoins size={20} className="nav-icon" />
                <span>Repayments</span>
              </NavLink>
            </ul>
            <ul>
              <NavLink to="/Admin/creditReports" className="nav-link">
                <FileText size={20} className="nav-icon" />
                <span>Credit Reports</span>
              </NavLink>
            </ul>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="settings-button" onClick={handleViewSite}>
            <Eye size={20} />
            <span>View Site</span>
          </button>
          <button className="settings-button">
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Flag_of_Lesotho.svg" 
              alt="Lesotho Flag" 
              className="lesotho-flag"
            />
            <div className="system-info">
              <h1 className="system-title">Credit Bureau Admninstrator</h1>
              <p className="system-subtitle">Empowering Financial Transparency in Lesotho</p>
            </div>
          </div>
          
          <div className="header-right">
            <form className="search-form" onSubmit={handleSearch}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </form>
            
            <div className="notification-bell">
              <button className="notification-button">
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="notification-badge">{unreadNotifications}</span>
                )}
              </button>
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  {unreadNotifications > 0 && (
                    <button 
                      className="mark-as-read"
                      onClick={markNotificationsAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.unread ? 'unread' : ''}`}
                      >
                        <div className="notification-content">
                          <p className="notification-message">{notification.message}</p>
                          <small className="notification-time">{notification.time}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="notification-footer">
                  <NavLink to="/Admin/notifications">View all notifications</NavLink>
                </div>
              </div>
            </div>
            
            {currentUser && (
              <div className="user-dropdown">
                <button className="user-profile">
                  <div className="user-avatar">
                    {userDisplay.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="username">{userDisplay.name}</span>
                    <span className="user-role">{userDisplay.role}</span>
                  </div>
                  <ChevronDown size={16} className="dropdown-arrow" />
                </button>
                <div className="dropdown-menu">
                  <button className="menu-item">
                    <UserCircle size={16} />
                    <span>Profile</span>
                  </button>
                  <button className="menu-item">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button onClick={handleLogout} className="menu-item">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="content-wrapper">
          <main className="content-area">
            <Outlet />
          </main>
        </div>

        <footer className="footer">
          <span>&copy; {new Date().getFullYear()} Lesotho Credit Bureau Management System</span>
        </footer>
      </div>
    </div>
  );
};

export default AdminHome;