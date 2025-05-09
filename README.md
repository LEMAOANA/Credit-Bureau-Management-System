"Credit Bureau Management System" 
# Step-by-Step Guide to build MongoDB Atlas
 step.1  Sign In with Google
        You’ll be prompted to create:
        An Organization
        A Project (e.g., PrimeAI-CreditData)

step.2 Click “Build a Cluster”
       Choose the Free Tier (M0)
       Select the closest region to your location
       Name your cluster (e.g., PrimeAICluster)
       Wait until setup completes and you can see: “Browse Collections” – where you can view and edit documents

step.3 Navigate to Database Access
       Add a DB user: Username (e.g., admin)
       Password (store safely)
       Assign permissions: read-only, readWrite, or atlasAdmin

step.4 Navigate to Network Access
       Add your device IP so it can connect: Use 0.0.0.0/0 (⚠️ allows all IPs)
       Add a comment (e.g., "Dev access") and confirm

step.5 Navigate to your cluster
       Click the “Connect” button on the cluster card
       chosses the user and Drivers
       Select your language or runtime (e.g., Node.js)
       choose URL

step.6 store your Mongo Url in your .env file in your project.

# Step-by-Step Guide to Run Project
Step 1: Clone the Repository
        Open your terminal and run:
        git clone https://github.com/your-username/Credit-Bureau-Management-System.git
        cd Credit-Bureau-Management-System

Step 2: Navigate to the Backend Folder
        cd backend

Step 3: Create a .env File
        Create a file named .env in the backend directory:
        Credit-Bureau-Management-System/
        └── backend/.env

Step 4: Add the Following Credentials to .env
        YOUR MONGODB_URL 
        PORT=5001
        JWT_SECRET=9cbd6299cb0075630bfc68946b8f6c97a941dcd3f39ffb9f63e9a5cac2f0b56b2b1f1063f7bb49366928186bf9c8c3d4f89c5de8e89e79dc4c456ac492f203d2
        JWT_EXPIRES_IN=90d

Step 5: Install Dependencies
        npm install

Step 6: Start the Backend Server
        npm run server
        The backend server will start at: http://localhost:5001

Step 7: Open a new terminal window or tab (do not stop the backend)
        Navigate to the Frontend Folder
        cd frontend

Step 8: Create a .env File
        Create a file named .env in the frontend directory:
        Credit-Bureau-Management-System/
        └── frontend/.env

Step 9: Add the Following Credentials to .env
        REACT_APP_API_URL=http://localhost:5001/api
        GENERATE_SOURCEMAP=false

Step 10: Install Dependencies
         npm install
Step 11: Start the Frontend Server
         npm start
         The frontend server will start at: http://localhost:3000
         You are well set and Test now



# steps to pull change from github
1. cd path/to/Credit-Bureau-Management-System
2. git branch (you see the brach callec "main")
3. git pull origin main
 
4. cd backend
   npm install
   npm run server

5. "on another terminal" 
6. cd path/to/Credit-Bureau-Management-System
7. cd frontend
   npm install
   npm start

# Borrower Login Testing Instructions

To test the borrower login functionality, use the borrower's National ID.

If you don't know a borrower's National ID, check the database and copy it for login testing.

Alternatively, you can register a new borrower and then use their National ID to test the login process.





# PROJECT STRUCTURE
Credit-Bureau-Management-System/
│
├── backend/                                   # Backend - Node.js, Express, MongoDB
│   ├── assets/
│   │   └── images/
│   │       └── LesothoFlag.png
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── testConnection.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── borrowerController.js
│   │   ├── creditReportController.js
│   │   ├── loanController.js
│   │   ├── repaymentController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── Borrower.js
│   │   ├── Loan.js
│   │   ├── Repayment.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── borrowerRoutes.js
│   │   ├── creditReportRoutes.js
│   │   ├── loanRoutes.js
│   │   ├── repaymentRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── utils/
│   │   ├── appError.js
│   │   ├── catchAsync.js
│   │   ├── csvGenerator.js
│   │   ├── pdfGenerator.js
│   │   └── generateSecret.js
│   │
│   ├── server.js
│   └── package.json
│
├── frontend/                                  # Frontend - React
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin.css
│   │   │   ├── Admin.js
│   │   │   ├── BorrowerSite.css
│   │   │   ├── BorrowerSite.js
│   │   │   ├── Borrowers.css
│   │   │   ├── Borrowers.js
│   │   │   ├── CreditReports.css
│   │   │   ├── CreditReports.js
│   │   │   ├── Dashboard.css
│   │   │   ├── Dashboard.js
│   │   │   ├── Landers.css
│   │   │   ├── Landers.js
│   │   │   ├── Loans.css
│   │   │   ├── Loans.js
│   │   │   ├── Login.css
│   │   │   ├── Login.js
│   │   │   ├── PrivateRoute.js
│   │   │   ├── Repayments.css
│   │   │   ├── Repayments.js
│   │   │   ├── Signup.css
│   │   │   ├── Signup.js
│   │   │   ├── BorrowerValidation.js          # Borrower Validation Page (Step 1)
│   │   │   ├── BorrowerValidation.css         # Borrower Validation Styling
│   │   │   ├── BorrowerRegistration.js        # Borrower Registration Page (Step 2)
│   │   │   ├── BorrowerRegistration.css       # Borrower Registration Styling
│   │   │   ├── LoanApplication.js             # Loan Application Page after Registration
│   │   │   └── LoanApplication.css            # Loan Application Styling
│   │
│   │   ├── contexts/
│   │   │   └── AuthContext.js                 # Context for managing authentication
│   │
│   │   ├── services/
│   │   │   ├── api.js                         # API service for API requests
│   │   │   └── authService.js                 # Handles authentication logic (login, registration)
│   │
│   │   ├── utils/
│   │   │   └── setupAxios.js                  # Axios setup for API calls
│   │
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│
├── .gitignore
├── package.json
├── README.md

