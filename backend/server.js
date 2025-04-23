require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const borrowerRoutes = require('./routes/borrowerRoutes');
const loanRoutes = require('./routes/loanRoutes');
const repaymentRoutes = require('./routes/repaymentRoutes');
const creditReportRoutes = require('./routes/creditReportRoutes');


// Configure mongoose to handle deprecation warnings
mongoose.set('strictQuery', false);

// Create Express app
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,  // 👈 Add this line
}));

// Middleware
app.use(express.json()); // For parsing application/json

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// Log environment variables (for debugging, remove in production)
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI 
    ? process.env.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@') 
    : 'Not found'
});

// Connect to MongoDB Atlas
connectDB();

// Default route to check if API is running
app.get('/', (req, res) => {
  res.send('Credit Bureau Management System API is running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes); // All user routes start with /api/users
app.use('/api', borrowerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/repayments', repaymentRoutes);
app.use('/api/creditReports', creditReportRoutes); 

// Health check endpoint for checking server and DB status
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only after MongoDB connection is established
mongoose.connection.once('open', () => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  });
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});
