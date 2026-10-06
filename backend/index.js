const express = require("express"); //Framnework
const cors = require("cors");// Middleware for communication between frontend and backend
const mongoose = require("mongoose"); // MongoDB object modeling tool
require("dotenv").config(); // Load environment variables from .env file

// Initialize Express app

const app = express();

//Middleware setup from here
app.use(cors());//Allows communication between frontend and backend
app.use(express.json());//Allows app to parse json resuests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

//Database connection setup
const PORT = process.env.PORT || 5001; // Use the port from environment variables or default to 5001
const MONGO_URI = process.env.MONGO_URI; // MongoDB connection string from environment variables

mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB Connecteion successful'))
.catch( err => console.error('Mongo Db Connection error', err));

// API Routes
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const noteRoutes = require('./routes/noteRoutes'); // Import note routes

// Health check endpoint (useful for Render/hosting monitoring)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

app.use('/api/notes', noteRoutes); // Use note routes for /api/notes endpoint
app.use('/api/auth', authRoutes); // Use auth routes for /api/auth endpoint

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));