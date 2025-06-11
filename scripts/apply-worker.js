const { Worker } = require('worker_threads');
const fs = require('fs').promises;
const path = require('path');

// Simple task to test worker functionality
const task = {
  file: 'test.txt',
  content: 'Hello from worker!'
};

// Create a worker
const worker = new Worker(__filename, {
  workerData: { task }
});

// Handle worker messages
worker.on('message', (result) => {
  console.log('Worker completed task:', result);
});

worker.on('error', (error) => {
  console.error('Worker error:', error);
});

worker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Worker stopped with exit code ${code}`);
  }
}); 