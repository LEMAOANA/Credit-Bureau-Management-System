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


# Step-by-Step Guide
Step 1: Clone the Repository
  Open your terminal and run:
   git clone https://github.com/your-username/Credit-Bureau-Management-System.git
     cd Credit-Bureau-Management-System

🔧 Backend Setup
Step 2: Navigate to the Backend Folder
  cd backend
Step 3: Create a .env File
  Create a file named .env in the backend directory:
   Credit-Bureau-Management-System/
     └── backend/
        └── .env
Step 4: Add the Following Credentials to .env
  MONGODB_URI=mongodb+srv://Student:s12345@nucleusdb.zdvm9.mongodb.net/credit-bureau?retryWrites=true&w=majority&appName=Nucleusdb
  PORT=5001
  JWT_SECRET=9cbd6299cb0075630bfc68946b8f6c97a941dcd3f39ffb9f63e9a5cac2f0b56b2b1f1063f7bb49366928186bf9c8c3d4f89c5de8e89e79dc4c456ac492f203d2
  JWT_EXPIRES_IN=90d
Step 5: Install Dependencies
  npm install
Step 6: Start the Backend Server
  npm run server
  The backend server will start at: http://localhost:5001

🌐 Frontend Setup
👉 Open a new terminal window or tab (do not stop the backend)
Step 7: Navigate to the Frontend Folder
  cd frontend
Step 8: Create a .env File
 Create a file named .env in the frontend directory:
   Credit-Bureau-Management-System/
      └── frontend/
           └── .env
Step 9: Add the Following Credentials to .env
   REACT_APP_API_URL=http://localhost:5001/api
   GENERATE_SOURCEMAP=false
Step 10: Install Dependencies
   npm install
Step 11: Start the Frontend Server
   npm start