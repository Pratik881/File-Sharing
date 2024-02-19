require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/dbConfig');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Set port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Template engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', require('./routes/homepage'));
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
