// backend/db/testConnection.js
require('dotenv').config(); // Load .env variables

const { MongoClient } = require('mongodb');

// Load URI from environment
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully');

    // Your actual database name: 'credit-bureau'
    const db = client.db('credit-bureau');
    const collections = await db.listCollections().toArray();

    console.log('📂 Collections:', collections.map(col => col.name));
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.close();
  }
}

testConnection();
