require('dotenv').config();
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000; // You can change the port if needed

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Create a MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Function to delete a user by ID
const deleteUser = (userId, callback) => {
    const query = 'DELETE FROM users WHERE id = ?';
    connection.execute(query, [userId], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results);
    });
};

// Handle DELETE request
app.delete('/deleteUser', (req, res) => {
    const userId = req.body.userId;
    deleteUser(userId, (error) => {
        if (error) {
            return res.status(500).json({ message: 'Error deleting user: ' + error });
        }
        res.json({ message: `User with ID ${userId} deleted successfully.` });
    });
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Connect to the database and start the server
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
