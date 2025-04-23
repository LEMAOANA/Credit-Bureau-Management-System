# .env in frontend

REACT_APP_API_URL=http://localhost:5001/api
GENERATE_SOURCEMAP=false

# .env

MONGODB_URI=mongodb+srv://Student:s12345@nucleusdb.zdvm9.mongodb.net/credit-bureau?retryWrites=true&w=majority&appName=Nucleusdb
PORT=5001
JWT_SECRET=9cbd6299cb0075630bfc68946b8f6c97a941dcd3f39ffb9f63e9a5cac2f0b56b2b1f1063f7bb49366928186bf9c8c3d4f89c5de8e89e79dc4c456ac492f203d2
JWT_EXPIRES_IN=90d







🚀 Getting Started with MongoDB Atlas (Free Tier, Using Google Login & Mongo URL)
✅ Step 1: Sign In with Google
Go to 👉 https://www.mongodb.com/cloud/atlas

Click “Sign In”, then choose “Continue with Google”

Select your Google account and allow access

After login, MongoDB Atlas will prompt you to create:

Your first organization

Your first project

🏠 Home Dashboard (After Login)
The dashboard shows:

Project overview

Active clusters

Quick-start shortcuts

🟢 Click into your project (e.g. Demo-PrimeAI) to begin

🧭 MongoDB Atlas Interface Navigation
🔹 1. Project Sidebar (Left Panel)
This menu appears when you're inside a project:

Clusters – Main dashboard for managing your DBs

Network Access – Whitelist IPs allowed to connect

Database Access – Add/manage DB users

Data API – For connecting frontend apps

Metrics – Monitor performance

Backups – Not active on Free Tier, but visible

Triggers – Serverless automation

Search Indexes – For text search (M0 doesn't support)

Data Federation / Charts / Realm – Advanced tools

🔸 2. Clusters Page (Your Core Workspace)
🧱 Cluster Card:

Browse Collections – View/edit your documents

Connect – Get your MongoDB connection URL (Mongo URI)

... More – Pause, rename, or delete your cluster

🔑 3. Database Access
📍 Go to: Security > Database Access

Add a DB user:

Username (e.g., admin)

Password (store safely)

Assign permissions:

read-only, readWrite, or atlasAdmin

✅ Pro Tip: Use the least privilege principle

🌐 4. Network Access
📍 Go to: Security > Network Access

Add your device IP so it can connect

For dev/testing only:
Use 0.0.0.0/0 (⚠️ allows all IPs)

🔌 5. Connect Your App (Mongo URL Setup)
On your cluster card, click Connect, then:

Choose "Connect your application"

You’ll see a connection string like:

plaintext
Copy
Edit
mongodb+srv://<username>:<password>@<clustername>.mongodb.net/<dbname>?retryWrites=true&w=majority
📎 Replace the placeholders:

<username> = your DB username

<password> = your DB password

<dbname> = the name of your database

🔗 Use this Mongo URL in your app (Node.js, Python, etc.) to connect

Example (Node.js):

javascript
Copy
Edit
mongoose.connect('mongodb+srv://admin:yourpassword@primeai.mongodb.net/testdb?retryWrites=true&w=majority');
📂 6. Browse Collections
Click Browse Collections to enter the GUI:

View all your collections

Add new documents

Run queries (filter/search)

Edit or delete records like a spreadsheet