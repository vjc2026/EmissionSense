const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const si = require('systeminformation'); // Import systeminformation package
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Use environment variable for secret key

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Use cors middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to insert user data into the MySQL database
app.post('/register', (req, res) => {
  const { name, email, password, organization, device, cpu, gpu, ram, motherboard, psu } = req.body;

  const query = `
    INSERT INTO users (name, email, password, organization, device, cpu, gpu, ram, motherboard, psu)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [name, email, password, organization, device, cpu, gpu, ram, motherboard, psu], (err, results) => {
    if (err) {
      console.error('Error inserting data into the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json({ message: 'User registered successfully' });
  });
});

// Endpoint to fetch device specifications
app.get('/device-specs', async (req, res) => {
  try {
    const cpuInfo = await si.cpu();
    const ramInfo = await si.mem();
    const gpuInfo = await si.graphics();
    const motherboardInfo = await si.baseboard();

    // Format and send the response
    res.json({
      cpu: `${cpuInfo.manufacturer} ${cpuInfo.brand}`,
      gpu: gpuInfo.controllers.length > 0 ? gpuInfo.controllers[0].model : 'No GPU Found',
      ram: (ramInfo.total / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      motherboard: motherboardInfo.model, // Assuming model has the info you need
      psu: 'PSU info here' // Placeholder for PSU, as this info isn't typically available
    });
  } catch (error) {
    console.error('Error fetching device specifications:', error);
    res.status(500).json({ error: 'Error fetching device specifications' });
  }
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = `
    SELECT id, name, email FROM users WHERE email = ? AND password = ?
  `;

  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      const user = results[0]; // Get the first user record
      const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token, userId: user.id, name: user.name, email: user.email });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Endpoint to fetch user's name and email after login
app.get('/user', authenticateToken, (req, res) => {
  const { email } = req.user;

  const query = `
    SELECT name, email FROM users WHERE email = ?
  `;

  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      res.status(200).json({ user: results[0] }); // Send back user details
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

app.post('/user_history', authenticateToken, (req, res) => {
  const { projectName, projectDescription, sessionDuration } = req.body;
  const userId = req.user.id; // Get the user ID from the authenticated token

  const query = `
    INSERT INTO user_history (user_id, project_name, project_description, session_duration)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(query, [userId, projectName, projectDescription, sessionDuration], (err, results) => {
    if (err) {
      console.error('Error inserting session data into the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json({ message: 'Session recorded successfully' });
  });
});

// Endpoint to fetch user's projects
app.get('/user_projects', authenticateToken, (req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated token

  const query = `
    SELECT id, project_name, project_description, session_duration FROM user_history WHERE user_id = ?
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json({ projects: results }); // Send back user's projects
  });
});

// Endpoint to delete a project
app.delete('/delete_project/:id', authenticateToken, (req, res) => {
  const projectId = req.params.id; // Get project ID from request parameters
  const userId = req.user.id; // Get user ID from the authenticated token

  const query = `
    DELETE FROM user_history WHERE id = ? AND user_id = ?
  `;

  connection.query(query, [projectId, userId], (err, results) => {
    if (err) {
      console.error('Error deleting project from the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  });
});


// Example of a protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
