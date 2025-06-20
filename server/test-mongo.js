const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://sevendysix:5LYWk4lZOTIXjltN@cluster0.kwecegc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing MongoDB connection...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', {
    name: err.name,
    message: err.message,
    code: err.code
  });
  process.exit(1);
}); 