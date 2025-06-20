const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Log startup info
console.log('Starting server with environment:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  PWD: process.env.PWD,
  JWT_SECRET: process.env.JWT_SECRET ? 'is set' : 'not set',
  MONGODB_URI: process.env.MONGODB_URI ? 'is set' : 'not set'
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    headers: req.headers
  });
  next();
});

// Basic health check
app.get('/_health', (req, res) => {
  res.json({ status: 'ok' });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

console.log('Loading routes...');

// Load routes with better error handling
let userRoutes, postRoutes;
try {
  console.log('Attempting to require userRoutes...');
  userRoutes = require('./routes/userRoutes');
  console.log('userRoutes loaded successfully');
  
  console.log('Attempting to require postRoutes...');
  postRoutes = require('./routes/postRoutes');
  console.log('postRoutes loaded successfully');
  
  // Mount routes
  if (userRoutes) {
    console.log('Mounting /api/users routes...');
    app.use('/api/users', userRoutes);
    console.log('/api/users routes mounted successfully');
  }
  
  if (postRoutes) {
    console.log('Mounting /api/posts routes...');
    app.use('/api/posts', postRoutes);
    console.log('/api/posts routes mounted successfully');
  }
  
  console.log('All routes mounted successfully');
} catch (error) {
  console.error('Error during route setup:', error);
  console.error('Stack trace:', error.stack);
  // Don't exit process, continue with basic functionality
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack trace:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Get port from environment
const PORT = process.env.PORT || 8080;
console.log('Server configuration:', {
  port: PORT,
  portType: typeof PORT,
  envPort: process.env.PORT,
  envPortType: typeof process.env.PORT
});

// Connect to MongoDB first, then start server
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  
  // Create server with error handling
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Server startup complete');
  })
  .on('error', (error) => {
    console.error('Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });

  // Implement proper shutdown
  let shuttingDown = false;

  function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    
    console.log('Shutting down...');
    
    // Close MongoDB connection
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed');
      
      server.close((err) => {
        if (err) {
          console.error('Error during shutdown:', err);
          process.exit(1);
        }
        process.exit(0);
      });
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Log uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    console.error('Stack trace:', error.stack);
    shutdown();
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    shutdown();
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});