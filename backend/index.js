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
const PORT = process.env.PORT || 5000; // Use the port from environment variables or default to 5000
const MONGO_URI = process.env.MONGO_URI; // MongoDB connection string from environment variables

mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB Connecteion successful'))
.catch( err => console.error('Mongo Db Connection error', err));

//API Routes will add in later
const noteRoutes = require('./routes/noteRoutes'); // Import note routes
app.use('/api/notes', noteRoutes); // Use note routes for /api/notes endpoint




app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));