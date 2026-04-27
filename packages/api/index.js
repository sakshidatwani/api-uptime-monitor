const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const checkRoutes = require('./routes/checkRoutes');
 const app = express();

connectDB();

// NEW: 1. Add Express Middleware
// This middleware is crucial for parsing the body of incoming POST, PUT, and PATCH requests.
// express.json() parses incoming JSON payloads.
app.use(express.json());
// express.urlencoded() parses payloads with 'Content-Type: application/x-www-form-urlencoded'.
// The 'extended: false' option means it uses Node's classic 'querystring' library for parsing.
app.use(express.urlencoded({ extended: false }));

// NEW: 2. Define a simple test/health route
// This is our first API endpoint.
// When a GET request is made to '/api/health', the handler function is executed.
app.get('/api/health', (req, res) => {
  // We send back a JSON response.
  // res.status(200) sets the HTTP status code to 200 OK, indicating success.
  // .json() sends a JSON payload and automatically sets the Content-Type header to 'application/json'.
  res.status(200).json({ status: 'UP', message: 'API is healthy' });
});
app.use('/api/auth', authRoutes);
app.use('/api/checks', checkRoutes);


const PORT =  5000;

app.listen(PORT, () => {    
  console.log(`API server is running and listening on port ${PORT}`);
});