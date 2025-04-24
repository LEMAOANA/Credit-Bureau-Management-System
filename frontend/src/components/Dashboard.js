import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  UserCircle,
  Loader2,
  MoreHorizontal,
  X,
  PieChart,
  Calendar,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Currency formatter for Lesotho Maloti
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LS', {
    style: 'currency',
    currency: 'LSL',
    minimumFractionDigits: 2
  }).format(amount);
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('30 days');
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoanProcessing, setShowLoanProcessing] = useState(false);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [borrowerStatusFilter, setBorrowerStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [users, setUsers] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loanStatusData, setLoanStatusData] = useState(null);
  const [repaymentTrendData, setRepaymentTrendData] = useState(null);
  const [borrowerDistributionData, setBorrowerDistributionData] = useState(null);

  // Form states
  const [newPayment, setNewPayment] = useState({
    borrowerId: '',
    borrowerName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    loanId: ''
  });
  const [newLoan, setNewLoan] = useState({
    borrowerId: '',
    amount: '',
    interestRate: 8.5,
    term: 12,
    purpose: 'Personal',
    status: 'Pending'
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    password: ''
  });
  const [processingAction, setProcessingAction] = useState('approve');
  const [selectedLoans, setSelectedLoans] = useState([]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, borrowersRes, loansRes, repaymentsRes] = await Promise.all([
          fetch('http://localhost:5001/api/users'),
          fetch('http://localhost:5001/api/borrowers'),
          fetch('http://localhost:5001/api/loans'),
          fetch('http://localhost:5001/api/repayments')
        ]);

        if (!usersRes.ok || !borrowersRes.ok || !loansRes.ok || !repaymentsRes.ok) {
          throw new Error('Failed to fetch data from one or more endpoints');
        }

        const usersData = await usersRes.json();
        const borrowersData = await borrowersRes.json();
        const loansData = await loansRes.json();
        const repaymentsData = await repaymentsRes.json();

        setUsers(usersData.data || usersData);
        setBorrowers(borrowersData.data || borrowersData);
        setLoans(loansData.data || loansData);
        setRepayments(repaymentsData.data || repaymentsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Process data when fetched or filters change
  useEffect(() => {
    if (users.length > 0 || borrowers.length > 0 || loans.length > 0 || repayments.length > 0) {
      processDashboardData();
    }
  }, [users, borrowers, loans, repayments, timeFilter, startDate, endDate]);

  const processDashboardData = () => {
    // Filter data based on date range
    const filteredLoans = loans.filter(loan => 
      new Date(loan.createdAt || loan.date) >= startDate && 
      new Date(loan.createdAt || loan.date) <= endDate
    );
    
    const filteredRepayments = repayments.filter(repayment => 
      new Date(repayment.createdAt || repayment.date) >= startDate && 
      new Date(repayment.createdAt || repayment.date) <= endDate
    );

    // Calculate total loan amounts
    const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const filteredLoanAmount = filteredLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const activeLoanAmount = filteredLoans
      .filter(l => l.status === 'Approved')
      .reduce((sum, loan) => sum + loan.amount, 0);
    const defaultedAmount = filteredLoans
      .filter(l => l.status === 'Defaulted')
      .reduce((sum, loan) => sum + loan.amount, 0);
    const repaymentAmount = filteredRepayments.reduce((sum, r) => sum + r.amount, 0);

    // Calculate stats
    const calculatedStats = [
      { 
        title: "Total Users", 
        value: users.length, 
        change: calculateChange(users.length, 30), 
        trend: "up",
        icon: <Users size={24} />
      },
      { 
        title: "Total Borrowers", 
        value: borrowers.length, 
        change: calculateChange(borrowers.length, 30), 
        trend: "up",
        icon: <UserCircle size={24} />
      },
      { 
        title: "Total Loans", 
        value: loans.length, 
        change: calculateChange(loans.length, 30), 
        trend: "up",
        icon: <CreditCard size={24} />,
        subValue: formatCurrency(totalLoanAmount)
      },
      { 
        title: "Active Loans", 
        value: filteredLoans.filter(l => l.status === 'Approved').length, 
        change: calculateChange(filteredLoans.filter(l => l.status === 'Approved').length, 30), 
        trend: filteredLoans.filter(l => l.status === 'Approved').length > 15 ? "up" : "down",
        icon: <CheckCircle size={24} />,
        subValue: formatCurrency(activeLoanAmount)
      },
      { 
        title: "Total Repayments", 
        value: filteredRepayments.length, 
        change: calculateChange(filteredRepayments.length, 30), 
        trend: "up",
        icon: <DollarSign size={24} />,
        subValue: formatCurrency(repaymentAmount)
      },
      { 
        title: "Default Rate", 
        value: `${((filteredLoans.filter(l => l.status === 'Defaulted').length / filteredLoans.length) * 100 || 0).toFixed(1)}%`, 
        change: "0%", 
        trend: "neutral",
        icon: <AlertCircle size={24} />,
        subValue: formatCurrency(defaultedAmount)
      }
    ];

    // Generate recent activities
    const recentActivities = [
      ...filteredRepayments
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 3)
        .map(repayment => ({
          id: repayment._id,
          type: "repayment",
          action: "received",
          user: borrowers.find(b => b._id === (repayment.borrower?._id || repayment.borrower))?.name || 'Unknown',
          amount: formatCurrency(repayment.amount),
          time: new Date(repayment.createdAt || repayment.date).toLocaleTimeString(),
          date: new Date(repayment.createdAt || repayment.date).toLocaleDateString()
        })),
      ...filteredLoans
        .filter(l => l.status === 'Approved')
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 2)
        .map(loan => ({
          id: loan._id,
          type: "loan",
          action: "approved",
          user: borrowers.find(b => b._id === (loan.borrower?._id || loan.borrower))?.name || 'Unknown',
          amount: formatCurrency(loan.amount),
          time: new Date(loan.createdAt || loan.date).toLocaleTimeString(),
          date: new Date(loan.createdAt || loan.date).toLocaleDateString()
        }))
    ].sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))
     .slice(0, 5);

    // Generate alerts
    const pendingLoans = filteredLoans.filter(loan => loan.status === "Pending");
    const overdueLoans = filteredLoans.filter(loan => 
      loan.status === "Approved" && 
      new Date(loan.dueDate || new Date(new Date(loan.createdAt || loan.date).setMonth(
        new Date(loan.createdAt || loan.date).getMonth() + (loan.term || 12)
      )) < new Date()
    ));
    
    const borrowersWithManyLoans = borrowers
      .map(borrower => {
        const loanCount = filteredLoans.filter(l => 
          l.borrower?._id === borrower._id || l.borrower === borrower._id
        ).length;
        return { ...borrower, loanCount };
      })
      .filter(b => b.loanCount >= 3)
      .sort((a, b) => b.loanCount - a.loanCount);

    const generatedAlerts = [
      { 
        id: 1,
        severity: pendingLoans.length > 5 ? "high" : pendingLoans.length > 0 ? "medium" : "low",
        message: `${pendingLoans.length} pending loans need approval`,
        data: pendingLoans,
        action: () => handleViewPendingLoans(pendingLoans)
      },
      {
        id: 2,
        severity: overdueLoans.length > 0 ? "high" : "low",
        message: overdueLoans.length > 0 
          ? `${overdueLoans.length} overdue loans`
          : 'No overdue loans',
        data: overdueLoans,
        action: () => navigate('/admin/loans', { state: { filter: 'overdue' } })
      },
      {
        id: 3,
        severity: borrowersWithManyLoans.length > 0 ? "medium" : "low",
        message: borrowersWithManyLoans.length > 0
          ? `${borrowersWithManyLoans.length} borrowers with ≥3 loans`
          : 'No borrowers with more than 3 loans',
        data: borrowersWithManyLoans,
        action: () => navigate('/admin/borrowers')
      }
    ];

    // Prepare chart data
    const loanStatusCounts = filteredLoans.reduce((acc, loan) => {
      acc[loan.status] = (acc[loan.status] || 0) + 1;
      return acc;
    }, {});

    const loanStatusChartData = {
      labels: Object.keys(loanStatusCounts),
      datasets: [{
        data: Object.values(loanStatusCounts),
        backgroundColor: [
          '#4ade80', // Approved
          '#facc15', // Pending
          '#f87171', // Rejected
          '#a78bfa', // Defaulted
          '#60a5fa'  // Paid
        ],
        borderColor: '#1f2937',
        borderWidth: 1
      }]
    };

    // Prepare repayment trend data (last 12 months)
    const monthlyRepayments = Array(12).fill(0).map((_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - i));
      return {
        month: month.toLocaleString('default', { month: 'short' }),
        year: month.getFullYear(),
        amount: filteredRepayments
          .filter(r => {
            const date = new Date(r.createdAt || r.date);
            return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
          })
          .reduce((sum, r) => sum + r.amount, 0)
      };
    });

    const repaymentTrendChartData = {
      labels: monthlyRepayments.map(r => `${r.month} '${r.year.toString().slice(2)}`),
      datasets: [{
        label: 'Repayment Amount',
        data: monthlyRepayments.map(r => r.amount),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true
      }]
    };

    // Borrower distribution by loan count
    const borrowerDistribution = [0, 1, 2, 3, 4, 5].map(count => ({
      count,
      borrowers: borrowers.filter(b => 
        filteredLoans.filter(l => l.borrower?._id === b._id || l.borrower === b._id).length === count
      ).length
    }));

    const borrowerDistributionChartData = {
      labels: borrowerDistribution.map(d => 
        d.count === 5 ? '5+' : d.count.toString()
      ),
      datasets: [{
        label: 'Borrowers',
        data: borrowerDistribution.map(d => d.borrowers),
        backgroundColor: [
          '#60a5fa',
          '#38bdf8',
          '#0ea5e9',
          '#0284c7',
          '#0369a1',
          '#075985'
        ],
        borderColor: '#1f2937',
        borderWidth: 1
      }]
    };

    setStats(calculatedStats);
    setRecentActivities(recentActivities);
    setAlerts(generatedAlerts);
    setLoanStatusData(loanStatusChartData);
    setRepaymentTrendData(repaymentTrendChartData);
    setBorrowerDistributionData(borrowerDistributionChartData);
  };

  const calculateChange = (currentValue, daysBack) => {
    // This is a simplified calculation - in a real app you'd compare with historical data
    const randomChange = (Math.random() * 10).toFixed(1);
    return `${randomChange}%`;
  };

  // Handlers
  const handleViewPendingLoans = (loans) => {
    navigate('/admin/loans', { state: { filter: 'pending' } });
  };

  const handleViewBorrowers = (borrowers) => {
    navigate('/admin/borrowers');
  };

  const toggleAlertExpansion = (alertId) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate, endDate })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loan-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Error generating report');
    }
  };

  const handleProcessLoans = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/loans/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: processingAction,
          loanIds: selectedLoans.length > 0 ? selectedLoans : undefined
        })
      });
      
      if (response.ok) {
        alert(`Loans ${processingAction}d successfully`);
        setShowLoanProcessing(false);
        setSelectedLoans([]);
        window.location.reload(); // Refresh data
      } else {
        alert('Failed to process loans');
      }
    } catch (error) {
      console.error('Loan processing error:', error);
      alert('Error processing loans');
    }
  };

  const handleRecordPayment = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/repayments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPayment,
          amount: parseFloat(newPayment.amount),
          date: new Date(newPayment.date).toISOString()
        })
      });
      
      if (response.ok) {
        alert('Payment recorded successfully');
        setShowPaymentModal(false);
        setNewPayment({
          borrowerId: '',
          borrowerName: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          loanId: ''
        });
        window.location.reload(); // Refresh data
      } else {
        alert('Failed to record payment');
      }
    } catch (error) {
      console.error('Payment recording error:', error);
      alert('Error recording payment');
    }
  };

  const handleCreateLoan = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLoan,
          amount: parseFloat(newLoan.amount),
          interestRate: parseFloat(newLoan.interestRate),
          term: parseInt(newLoan.term)
        })
      });
      
      if (response.ok) {
        alert('Loan created successfully');
        setShowNewLoanModal(false);
        setNewLoan({
          borrowerId: '',
          amount: '',
          interestRate: 8.5,
          term: 12,
          purpose: 'Personal',
          status: 'Pending'
        });
        window.location.reload(); // Refresh data
      } else {
        alert('Failed to create loan');
      }
    } catch (error) {
      console.error('Loan creation error:', error);
      alert('Error creating loan');
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        alert('User created successfully');
        setShowUserModal(false);
        setNewUser({
          name: '',
          email: '',
          role: 'user',
          password: ''
        });
        window.location.reload(); // Refresh data
      } else {
        alert('Failed to create user');
      }
    } catch (error) {
      console.error('User creation error:', error);
      alert('Error creating user');
    }
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    const today = new Date();
    switch (filter) {
      case '7 days':
        setStartDate(new Date(today.setDate(today.getDate() - 7)));
        break;
      case '30 days':
        setStartDate(new Date(today.setDate(today.getDate() - 30)));
        break;
      case '90 days':
        setStartDate(new Date(today.setDate(today.getDate() - 90)));
        break;
      case 'year':
        setStartDate(new Date(today.setFullYear(today.getFullYear() - 1)));
        break;
      default:
        setStartDate(new Date(today.setDate(today.getDate() - 30)));
    }
    setEndDate(new Date());
  };

  const handleUserSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBorrowerSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(user => roleFilter ? user.role === roleFilter : true);
  }, [users, searchTerm, roleFilter]);

  const filteredBorrowers = useMemo(() => {
    return borrowers.filter(borrower => 
      borrower.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(borrower => borrowerStatusFilter ? borrower.status === borrowerStatusFilter : true);
  }, [borrowers, searchTerm, borrowerStatusFilter]);

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.raw);
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={24} />
        <h3>Error loading dashboard</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  const StatCard = ({ title, value, change, trend, icon, subValue }) => (
    <div className="stat-card">
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {subValue && <div className="stat-subvalue">{subValue}</div>}
        <div className={`stat-change ${trend}`}>
          {change} <ArrowUpRight size={14} />
        </div>
      </div>
      <div className="stat-icon">
        {icon}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Record New Payment</h3>
              <button onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Borrower</label>
                <select
                  value={newPayment.borrowerId}
                  onChange={(e) => {
                    const selectedBorrower = borrowers.find(b => b._id === e.target.value);
                    setNewPayment({
                      ...newPayment,
                      borrowerId: e.target.value,
                      borrowerName: selectedBorrower?.name || ''
                    });
                  }}
                >
                  <option value="">Select Borrower</option>
                  {borrowers.map(borrower => (
                    <option key={borrower._id} value={borrower._id}>
                      {borrower.name} ({borrower.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Loan</label>
                <select
                  value={newPayment.loanId}
                  onChange={(e) => setNewPayment({...newPayment, loanId: e.target.value})}
                  disabled={!newPayment.borrowerId}
                >
                  <option value="">Select Loan (Optional)</option>
                  {loans
                    .filter(loan => loan.borrower?._id === newPayment.borrowerId || loan.borrower === newPayment.borrowerId)
                    .map(loan => (
                      <option key={loan._id} value={loan._id}>
                        {formatCurrency(loan.amount)} - {loan.purpose} (Due: {new Date(loan.dueDate).toLocaleDateString()})
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount (M)</label>
                <input 
                  type="number" 
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  placeholder="Enter amount"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-button"
                onClick={handleRecordPayment}
                disabled={!newPayment.borrowerId || !newPayment.amount}
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loan Processing Modal */}
      {showLoanProcessing && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Process Loans</h3>
              <button onClick={() => setShowLoanProcessing(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Action</label>
                <select
                  value={processingAction}
                  onChange={(e) => setProcessingAction(e.target.value)}
                >
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                </select>
              </div>
              <div className="form-group">
                <label>Loans to Process</label>
                <select
                  multiple
                  size="5"
                  value={selectedLoans}
                  onChange={(e) => {
                    const options = [...e.target.options];
                    const selectedValues = options
                      .filter(option => option.selected)
                      .map(option => option.value);
                    setSelectedLoans(selectedValues);
                  }}
                >
                  {loans
                    .filter(loan => loan.status === 'Pending')
                    .map(loan => (
                      <option key={loan._id} value={loan._id}>
                        {borrowers.find(b => b._id === (loan.borrower?._id || loan.borrower))?.name || 'Unknown'} - {formatCurrency(loan.amount)}
                      </option>
                    ))}
                </select>
                <small>Hold Ctrl/Cmd to select multiple</small>
              </div>
              <p>
                {selectedLoans.length > 0 
                  ? `Processing ${selectedLoans.length} selected loans`
                  : 'This will process all pending loans with the selected action.'}
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowLoanProcessing(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-button"
                onClick={handleProcessLoans}
              >
                Process Loans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Loan Modal */}
      {showNewLoanModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Loan</h3>
              <button onClick={() => setShowNewLoanModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Borrower</label>
                <select
                  value={newLoan.borrowerId}
                  onChange={(e) => setNewLoan({...newLoan, borrowerId: e.target.value})}
                >
                  <option value="">Select Borrower</option>
                  {borrowers.map(borrower => (
                    <option key={borrower._id} value={borrower._id}>
                      {borrower.name} ({borrower.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount (M)</label>
                <input 
                  type="number" 
                  value={newLoan.amount}
                  onChange={(e) => setNewLoan({...newLoan, amount: e.target.value})}
                  placeholder="Enter loan amount"
                />
              </div>
              <div className="form-group">
                <label>Interest Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={newLoan.interestRate}
                  onChange={(e) => setNewLoan({...newLoan, interestRate: e.target.value})}
                  placeholder="Enter interest rate"
                />
              </div>
              <div className="form-group">
                <label>Term (months)</label>
                <input 
                  type="number" 
                  value={newLoan.term}
                  onChange={(e) => setNewLoan({...newLoan, term: e.target.value})}
                  placeholder="Enter loan term"
                />
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <select
                  value={newLoan.purpose}
                  onChange={(e) => setNewLoan({...newLoan, purpose: e.target.value})}
                >
                  <option value="Personal">Personal</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Home">Home</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newLoan.status}
                  onChange={(e) => setNewLoan({...newLoan, status: e.target.value})}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowNewLoanModal(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-button"
                onClick={handleCreateLoan}
                disabled={!newLoan.borrowerId || !newLoan.amount}
              >
                Create Loan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button onClick={() => setShowUserModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="borrower">Borrower</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowUserModal(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-button"
                onClick={handleCreateUser}
                disabled={!newUser.name || !newUser.email || !newUser.password}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="header-content">
          <h2>Loan Management Dashboard</h2>
          <p>Welcome back! Here's what's happening with your loan system today.</p>
        </div>
        <div className="header-actions">
          <div className="date-range-picker">
            <Calendar size={16} />
            <DatePicker
              selected={startDate}
              onChange={(dates) => {
                const [start, end] = dates;
                setStartDate(start);
                setEndDate(end || start);
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              customInput={
                <button className="date-range-button">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  <ChevronDown size={16} />
                </button>
              }
            />
          </div>
          <button 
            className="generate-report-button"
            onClick={handleGenerateReport}
          >
            <FileText size={16} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'borrowers' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrowers')}
        >
          Borrowers
        </button>
        <button 
          className={`tab-button ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          Loans
        </button>
        <button 
          className={`tab-button ${activeTab === 'repayments' ? 'active' : ''}`}
          onClick={() => setActiveTab('repayments')}
        >
          Repayments
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                trend={stat.trend}
                icon={stat.icon}
                subValue={stat.subValue}
              />
            ))}
          </div>

          {/* Main Content Area */}
          <div className="dashboard-content">
            {/* Left Column */}
            <div className="dashboard-column">
              {/* Loan Status Distribution */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Loan Status Distribution</h3>
                  <div className="time-filter">
                    <select 
                      value={timeFilter}
                      onChange={(e) => handleTimeFilterChange(e.target.value)}
                      className="filter-select"
                    >
                      <option value="7 days">Last 7 days</option>
                      <option value="30 days">Last 30 days</option>
                      <option value="90 days">Last 90 days</option>
                      <option value="year">Last Year</option>
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </div>
                <div className="chart-container">
                  {loanStatusData ? (
                    <Pie 
                      data={loanStatusData} 
                      options={pieChartOptions}
                      height={300}
                    />
                  ) : (
                    <div className="chart-placeholder">
                      <PieChart size={48} />
                      <p>No loan data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Repayment Trends */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Repayment Trends</h3>
                  <TrendingUp size={18} />
                </div>
                <div className="chart-container">
                  {repaymentTrendData ? (
                    <Line 
                      data={repaymentTrendData} 
                      options={lineChartOptions}
                      height={300}
                    />
                  ) : (
                    <div className="chart-placeholder">
                      <BarChart2 size={48} />
                      <p>No repayment data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="dashboard-column">
              {/* Borrower Distribution */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Borrower Loan Distribution</h3>
                  <Users size={18} />
                </div>
                <div className="chart-container">
                  {borrowerDistributionData ? (
                    <Bar 
                      data={borrowerDistributionData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.raw} borrowers`;
                              }
                            }
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              drawBorder: false,
                            },
                            ticks: {
                              stepSize: 1
                            }
                          },
                          x: {
                            grid: {
                              display: false,
                              drawBorder: false,
                            }
                          }
                        },
                      }}
                      height={300}
                    />
                  ) : (
                    <div className="chart-placeholder">
                      <BarChart2 size={48} />
                      <p>No borrower data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Recent Activities</h3>
                  <Clock size={18} />
                </div>
                <div className="activities-list">
                  {recentActivities.length > 0 ? (
                    recentActivities.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          {activity.type === "loan" && <CreditCard size={16} />}
                          {activity.type === "repayment" && <DollarSign size={16} />}
                        </div>
                        <div className="activity-details">
                          <p>
                            <strong>{activity.user}</strong> {activity.action} a {activity.type} of {activity.amount}
                          </p>
                          <span className="activity-time">
                            {activity.time} • {activity.date}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activities">
                      <p>No recent activities found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Alerts & Notifications */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Alerts & Notifications</h3>
                  <AlertCircle size={18} />
                </div>
                <div className="alerts-list">
                  {alerts.length > 0 ? (
                    alerts.map(alert => (
                      <div key={alert.id} className={`alert-item ${alert.severity}`}>
                        <div className="alert-icon">
                          {alert.severity === "high" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        </div>
                        <div className="alert-content">
                          <div className="alert-message">
                            <p>{alert.message}</p>
                          </div>
                          <button 
                            className="action-link"
                            onClick={alert.action}
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-alerts">
                      <CheckCircle size={16} />
                      <p>No active alerts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="data-table-container">
          <div className="table-header">
            <h3>Users</h3>
            <button 
              className="add-button"
              onClick={() => setShowUserModal(true)}
            >
              <Plus size={16} />
              <span>Add User</span>
            </button>
          </div>
          <div className="table-filters">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search users..." 
                onChange={handleUserSearch}
              />
            </div>
            <div className="filter-dropdown">
              <Filter size={16} />
              <select onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="borrower">Borrower</option>
              </select>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <UserCircle size={20} />
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${user.status || 'active'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Borrowers Tab */}
      {activeTab === 'borrowers' && (
        <div className="data-table-container">
          <div className="table-header">
            <h3>Borrowers</h3>
            <button 
              className="add-button"
              onClick={() => navigate('/admin/borrowers/new')}
            >
              <Plus size={16} />
              <span>Add Borrower</span>
            </button>
          </div>
          <div className="table-filters">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search borrowers..." 
                onChange={handleBorrowerSearch}
              />
            </div>
            <div className="filter-dropdown">
              <Filter size={16} />
              <select onChange={(e) => setBorrowerStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Loans</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBorrowers.map(borrower => (
                <tr key={borrower._id}>
                  <td>
                    <div className="user-info">
                      <UserCircle size={20} />
                      <span>{borrower.name}</span>
                    </div>
                  </td>
                  <td>{borrower.email}</td>
                  <td>{borrower.phone || 'N/A'}</td>
                  <td>
                    {loans.filter(l => l.borrower?._id === borrower._id || l.borrower === borrower._id).length}
                  </td>
                  <td>
                    <span className={`status-badge ${borrower.status || 'active'}`}>
                      {borrower.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => navigate(`/admin/borrowers/${borrower._id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="data-table-container">
          <div className="table-header">
            <h3>Loans</h3>
            <div className="header-actions">
              <button 
                className="add-button"
                onClick={() => setShowNewLoanModal(true)}
              >
                <Plus size={16} />
                <span>New Loan</span>
              </button>
              <button 
                className="process-button"
                onClick={() => setShowLoanProcessing(true)}
              >
                Process Loans
              </button>
            </div>
          </div>
          <div className="table-filters">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search loans..." 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <Filter size={16} />
              <select>
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Defaulted</option>
              </select>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Amount</th>
                <th>Interest</th>
                <th>Term</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans
                .filter(loan => 
                  (borrowers.find(b => b._id === (loan.borrower?._id || loan.borrower))?.name || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  loan.purpose.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(loan => (
                  <tr key={loan._id}>
                    <td>
                      {borrowers.find(b => b._id === (loan.borrower?._id || loan.borrower))?.name || 'Unknown'}
                    </td>
                    <td>{formatCurrency(loan.amount)}</td>
                    <td>{loan.interestRate}%</td>
                    <td>{loan.term} months</td>
                    <td>{loan.purpose}</td>
                    <td>
                      <span className={`status-badge ${loan.status.toLowerCase()}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>
                      {loan.dueDate 
                        ? new Date(loan.dueDate).toLocaleDateString() 
                        : new Date(new Date(loan.createdAt).setMonth(
                            new Date(loan.createdAt).getMonth() + (loan.term || 12)
                          )).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        className="action-button"
                        onClick={() => navigate(`/admin/loans/${loan._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Repayments Tab */}
      {activeTab === 'repayments' && (
        <div className="data-table-container">
          <div className="table-header">
            <h3>Repayments</h3>
            <button 
              className="add-button"
              onClick={() => setShowPaymentModal(true)}
            >
              <Plus size={16} />
              <span>Record Payment</span>
            </button>
          </div>
          <div className="table-filters">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search repayments..." 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <Filter size={16} />
              <select>
                <option>All Repayments</option>
                <option>This Month</option>
                <option>Last Month</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Loan</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {repayments
                .filter(repayment => 
                  (borrowers.find(b => b._id === (repayment.borrower?._id || repayment.borrower))?.name || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  repayment.amount.toString().includes(searchTerm)
                )
                .map(repayment => (
                  <tr key={repayment._id}>
                    <td>
                      {borrowers.find(b => b._id === (repayment.borrower?._id || repayment.borrower))?.name || 'Unknown'}
                    </td>
                    <td>
                      {loans.find(l => l._id === repayment.loan)?.purpose || 'N/A'}
                    </td>
                    <td>{formatCurrency(repayment.amount)}</td>
                    <td>{new Date(repayment.createdAt || repayment.date).toLocaleDateString()}</td>
                    <td>{repayment.method || 'Bank Transfer'}</td>
                    <td>
                      <span className="status-badge completed">
                        Completed
                      </span>
                    </td>
                    <td>
                      <button 
                        className="action-button"
                        onClick={() => navigate(`/admin/repayments/${repayment._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions-bar">
        <button 
          className="quick-action"
          onClick={() => setShowPaymentModal(true)}
        >
          <DollarSign size={18} />
          <span>Record Payment</span>
        </button>
        <button 
          className="quick-action"
          onClick={() => setShowNewLoanModal(true)}
        >
          <CreditCard size={18} />
          <span>Create Loan</span>
        </button>
        <button 
          className="quick-action"
          onClick={() => setShowUserModal(true)}
        >
          <UserCircle size={18} />
          <span>Add User</span>
        </button>
        <button 
          className="quick-action"
          onClick={() => navigate('/admin/credit-reports')}
        >
          <FileText size={18} />
          <span>Credit Reports</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;