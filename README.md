"Credit Bureau Management System" 
# PROJECT STRUCTURE
Credit-Bureau-Management-System/
│
├── backend/                         # Backend (Node.js, Express, MongoDB)
│   ├── config/
│   │   └── db.js                    # MongoDB connection file
│   │
│   ├── controllers/                 # Handles logic for each resource
│   │   ├── authController.js
│   │   ├── borrowerController.js
│   │   ├── loanController.js
│   │   ├── repaymentController.js
│   │   └── creditReportController.js
│   │
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js
│   │   ├── Borrower.js
│   │   ├── Loan.js
│   │   ├── Repayment.js
│   │   └── CreditReport.js
│   │
│   ├── routes/                      # Express routes
│   │   ├── authRoutes.js
│   │   ├── borrowerRoutes.js
│   │   ├── loanRoutes.js
│   │   ├── repaymentRoutes.js
│   │   └── creditReportRoutes.js
│   │
│   ├── middleware/                  # Custom middleware
│   │   └── authMiddleware.js
│   │
│   ├── utilities/                   # Helpers and error handlers
│   │   ├── appError.js
│   │   └── catchAsync.js
│   │
│   ├── server.js                    # Starts the Express server
│   ├── package.json
│   ├── .env
│   └── README.md
│
├── frontend/                        # Frontend (React)
│   ├── public/
│   │   └── index.html               # Main HTML file
│   │
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Dashboard.js         # Dashboard with credit summary
│   │   │   ├── BorrowerForm.js
│   │   │   ├── LoanForm.js
│   │   │   ├── RepaymentForm.js
│   │   │   └── CreditReportView.js
│   │   │
│   │   ├── pages/                   # Full pages/views
│   │   │   ├── Home.js
│   │   │   ├── Borrowers.js
│   │   │   ├── Loans.js
│   │   │   └── Reports.js
│   │   │
│   │   ├── App.js                   # Root component
│   │   ├── index.js                 # React app entry point
│   │   └── App.css                  # Styling
│   │
│   ├── package.json
│   └── README.md
│
├── .gitignore                       # Ignore node_modules, env files, etc.
└── README.md                        # Overview and setup instructions


# REQUIRMENTS
💳 Credit Bureau Management System
A comprehensive full-stack application designed to manage and analyze consumer credit data. Built with MongoDB, Node.js, Express, and React.js, the system enables secure credit record management, score computation, and insightful data visualization.

🚀 Key Features
✅ Perform full CRUD operations on credit records

📊 Calculate credit scores based on repayment and borrowing behavior

📈 Visualize credit trends and history using interactive charts

🔐 Secure authentication using JWT

🖥️ Responsive and dynamic UI built with React

🧰 Tech Stack
Layer	Technology
Database	MongoDB
Backend	Node.js, Express.js, Mongoose
Frontend	React.js, Axios
Visualization	Chart.js
Auth	JSON Web Tokens (JWT)


# Relationship Matrix Table
From / To	Users (Lender)	Borrowers	Loans	Repayments	CreditReports
Users	—	1-to-Many	1-to-Many	—	1-to-Many
Borrowers	Many-to-1	—	1-to-Many	—	1-to-Many
Loans	Many-to-1	Many-to-1	—	1-to-Many	—
Repayments	—	—	Many-to-1	—	—
CreditReports	Many-to-1	Many-to-1	—	(derived from loans & repayments)	—
