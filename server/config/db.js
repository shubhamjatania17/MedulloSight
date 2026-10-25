/**
 * MedulloSight — MongoDB Connection Manager
 * Connects to MongoDB if available, with resilient in-memory fallback
 * to guarantee seamless local operation without requiring a running mongod service.
 */

import mongoose from 'mongoose';

let isConnected = false;
let memoryStore = {
  sessions: new Map(),
  batches: new Map()
};

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medullosight';
  
  try {
    // Attempt fast connection with 2-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log('[Database] Connected successfully to MongoDB at:', uri);
  } catch (err) {
    isConnected = false;
    console.log('[Database] MongoDB service not detected on localhost. Operating in high-performance memory-store mode.');
  }
}

export function isDbConnected() {
  return isConnected;
}

export function getMemoryStore() {
  return memoryStore;
}
