"Credit Bureau Management System" 
# PROJECT STRUCTURE
Credit-Bureau-Management-System/
│
├── backend/                                   # Backend - Node.js, Express, MongoDB
│   ├── config/                                 # Configuration files
│   │   └── db.js                               # MongoDB connection setup
│   │
│   ├── controllers/                            # Route handler logic (controllers)
│   │   ├── authController.js
│   │   ├── borrowerController.js
│   │   ├── loanController.js
│   │   ├── repaymentController.js
│   │   └── creditReportController.js
│   │
│   ├── models/                                 # Mongoose schemas (data models)
│   │   ├── User.js
│   │   ├── Borrower.js
│   │   ├── Loan.js
│   │   ├── Repayment.js
│   │   └── CreditReport.js
│   │
│   ├── routes/                                 # API route definitions
│   │   ├── authRoutes.js
│   │   ├── borrowerRoutes.js
│   │   ├── loanRoutes.js
│   │   ├── repaymentRoutes.js
│   │   └── creditReportRoutes.js
│   │
│   ├── middleware/                             # Middleware functions
│   │   └── authMiddleware.js                   # Auth/authentication middleware
│   │
│   ├── utilities/                              # Utility functions & error handlers
│   │   ├── appError.js                         # Custom error class
│   │   └── catchAsync.js                       # Async error wrapper
│   │
│   ├── server.js                               # Entry point to start the backend server
│   ├── package.json                            # Backend dependencies & scripts
│   ├── .env                                    # Environment variables
│   └── README.md
│
├── frontend/                                   # Frontend - React
│   ├── public/
                asssets/ 
                    images/
                    LesothoFlag.png                 # Publicly accessible static files
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/                         # Reusable UI components
│   │   │   ├── Home.js
│   │   │   ├── Home.css
│   │   │   ├── Login.js
│   │   │   └── Login.css
                users,js
                Borrowers.js
                Loans.js
                Repayments,js
                CreditReports.js
│   │   │
│   │   ├── contexts/                           # React context providers
│   │   │   └── AuthContext.js
│   │   │
│   │   ├── services/                           # Frontend service/API layer
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js                            # React entry point
│   │   └── index.css
│   │
│   ├── .env                                    # Frontend environment variables
│   ├── package.json                            # Frontend dependencies & scripts
│   └── node_modules/
│
├── .gitignore                                  # Files and folders to be ignored by Git
└── README.md                                   # Project overview and documentation


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
