const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return true;

  const uri = process.env.MONGODB_URI;
  if (!uri) return false;

  try {
    await mongoose.connect(uri);
    isConnected = true;
    if (process.env.NODE_ENV !== 'production') {
      console.log('✓ Connected to MongoDB');
    }
    return true;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }
}

function getIsConnected() {
  return isConnected;
}

module.exports = { connectDB, getIsConnected };
