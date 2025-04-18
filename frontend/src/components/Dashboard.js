import React from 'react';
import { 
  Activity, 
  ArrowUpRight, 
  BarChart2, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  CreditCard,
  FileText,
  ChevronDown,
  DollarSign,
  UserCircle
} from 'lucide-react';
import './Dashboard.css';
const AdminDashboard = () => {
  // Mock data - in a real app this would come from API calls
  const stats = [
    { title: "Total Landers", value: "1,245", change: "+12%", trend: "up" },
    { title: "Total Borrowers", value: "8,752", change: "+5%", trend: "up" },
    { title: "Active Loans", value: "3,421", change: "-2%", trend: "down" },
    { title: "Pending Approvals", value: "128", change: "+8%", trend: "up" }
  ];

  const recentActivities = [
    { id: 1, type: "loan", action: "approved", user: "John Doe", time: "10 mins ago" },
    { id: 2, type: "repayment", action: "received", user: "Jane Smith", time: "25 mins ago" },
    { id: 3, type: "credit report", action: "requested", user: "Lerato Mokoena", time: "1 hour ago" },
    { id: 4, type: "new borrower", action: "registered", user: "Thabo Bester", time: "2 hours ago" }
  ];

  const alerts = [
    { id: 1, severity: "high", message: "3 overdue repayments need attention" },
    { id: 2, severity: "medium", message: "New lender application requires verification" },
    { id: 3, severity: "low", message: "System maintenance scheduled for tonight" }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome back! Here's what's happening with your system today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.trend}`}>
                {stat.change} <ArrowUpRight size={14} />
              </div>
            </div>
            <div className="stat-icon">
              {stat.title.includes("Landers") && <Users size={24} />}
              {stat.title.includes("Borrowers") && <Users size={24} />}
              {stat.title.includes("Loans") && <CreditCard size={24} />}
              {stat.title.includes("Approvals") && <FileText size={24} />}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Activity Chart */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Loan Activity</h3>
              <div className="time-filter">
                <span>Last 30 days</span>
                <ChevronDown size={16} />
              </div>
            </div>
            <div className="chart-container">
              {/* This would be replaced with an actual chart component */}
              <div className="mock-chart">
                <BarChart2 size={48} />
                <p>Loan application and approval trends chart</p>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Activities</h3>
              <Clock size={18} />
            </div>
            <div className="activities-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === "loan" && <CreditCard size={16} />}
                    {activity.type === "repayment" && <DollarSign size={16} />}
                    {activity.type === "credit report" && <FileText size={16} />}
                    {activity.type === "new borrower" && <UserCircle size={16} />}
                  </div>
                  <div className="activity-details">
                    <p>
                      <strong>{activity.user}</strong> {activity.action} a {activity.type}
                    </p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          {/* Performance Metrics */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>System Performance</h3>
              <TrendingUp size={18} />
            </div>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-value">98.7%</div>
                <div className="metric-label">Uptime</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">2.3s</div>
                <div className="metric-label">Avg. Response</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">1,024</div>
                <div className="metric-label">Daily Requests</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">0</div>
                <div className="metric-label">Critical Issues</div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Alerts & Notifications</h3>
              <AlertCircle size={18} />
            </div>
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.severity}`}>
                  <div className="alert-icon">
                    {alert.severity === "high" && <AlertCircle size={16} />}
                    {alert.severity === "medium" && <AlertCircle size={16} />}
                    {alert.severity === "low" && <CheckCircle size={16} />}
                  </div>
                  <p>{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
              <Activity size={18} />
            </div>
            <div className="quick-actions">
              <button className="action-button">
                <FileText size={16} />
                <span>Generate Report</span>
              </button>
              <button className="action-button">
                <Users size={16} />
                <span>Add New User</span>
              </button>
              <button className="action-button">
                <CreditCard size={16} />
                <span>Process Loans</span>
              </button>
              <button className="action-button">
                <DollarSign size={16} />
                <span>Record Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;