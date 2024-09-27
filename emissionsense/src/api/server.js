// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_secret_key'; // Replace with a strong secret key

// MongoDB Atlas connection
const MONGO_URI = 'mongodb+srv://vscodejcv:k7ljIx9GPmVQnpNX@cluster0.gv0gw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Use cors middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define a Mongoose Schema and Model for users
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  organization: String,
  device: String,
  cpu: String,
  gpu: String,
  ram: String,
  motherboard: String,
  psu: String,
});

const User = mongoose.model('User', userSchema);

// Endpoint to insert user data into the MongoDB database
app.post('/register', async (req, res) => {
  const { email, password, organization, device, cpu, gpu, ram, motherboard, psu } = req.body;

  const newUser = new User({
    email,
    password,
    organization,
    device,
    cpu,
    gpu,
    ram,
    motherboard,
    psu,
  });

  try {
    await newUser.save();
    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error inserting data into the database:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (user) {
      // Generate a JWT token
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error querying the database:', error);
    res.status(500).json({ error: 'Database error' });
  }
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

app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
