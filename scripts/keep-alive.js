#!/usr/bin/env node

/**
 * Supabase Keep-Alive Script
 * 
 * This script pings the keep-alive endpoint to prevent Supabase from going to sleep.
 * Run this script periodically (every 5-10 minutes) to maintain database connections.
 * 
 * Usage:
 *   node scripts/keep-alive.js
 *   node scripts/keep-alive.js --url https://your-app.vercel.app
 *   node scripts/keep-alive.js --interval 300000 (5 minutes)
 */

const https = require('https');
const http = require('http');

// Configuration
const DEFAULT_URL = 'http://localhost:3001';
const DEFAULT_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Parse command line arguments
const args = process.argv.slice(2);
const url = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || DEFAULT_URL;
const intervalArg = args.find(arg => arg.startsWith('--interval='))?.split('=')[1];
const interval = intervalArg ? parseInt(intervalArg) : DEFAULT_INTERVAL;

const keepAliveUrl = `${url}/api/keep-alive`;

console.log(`🔄 Starting Supabase Keep-Alive Service`);
console.log(`📍 URL: ${keepAliveUrl}`);
console.log(`⏰ Interval: ${interval / 1000} seconds`);
console.log(`🚀 Starting in 5 seconds...\n`);

// Function to ping the keep-alive endpoint
async function pingKeepAlive() {
  return new Promise((resolve, reject) => {
    const client = keepAliveUrl.startsWith('https') ? https : http;
    
    const req = client.get(keepAliveUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: response,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Main keep-alive loop
async function startKeepAlive() {
  let successCount = 0;
  let errorCount = 0;
  
  const runPing = async () => {
    try {
      const result = await pingKeepAlive();
      
      if (result.status === 200) {
        successCount++;
        console.log(`✅ [${result.timestamp}] Keep-alive successful (${successCount} total)`);
        if (result.data.message) {
          console.log(`   📝 ${result.data.message}`);
        }
      } else {
        errorCount++;
        console.log(`⚠️  [${result.timestamp}] Keep-alive returned status ${result.status}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`❌ [${new Date().toISOString()}] Keep-alive failed: ${error.message}`);
    }
    
    // Schedule next ping
    setTimeout(runPing, interval);
  };
  
  // Start the first ping after 5 seconds
  setTimeout(runPing, 5000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(`\n🛑 Stopping Keep-Alive Service`);
    console.log(`📊 Final Stats: ${successCount} successful, ${errorCount} failed`);
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log(`\n🛑 Stopping Keep-Alive Service`);
    console.log(`📊 Final Stats: ${successCount} successful, ${errorCount} failed`);
    process.exit(0);
  });
}

// Start the service
startKeepAlive().catch((error) => {
  console.error('❌ Failed to start keep-alive service:', error);
  process.exit(1);
});
