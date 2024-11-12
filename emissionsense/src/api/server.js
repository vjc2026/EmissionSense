const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mysql = require('mysql2');
require('dotenv').config();

const path = require('path');
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
   cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
   cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

  // Ensure the uploads directory exists
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

app.post('/check-email', (req, res) => {
  const { email } = req.body;

  // SQL query to check for existing email
  const query = 'SELECT * FROM users WHERE email = ?'; // Replace 'users' with your table name

  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      return res.json({ exists: true }); // Email exists
    } else {
      return res.json({ exists: false }); // Email does not exist
    }
  });
});

// Endpoint to insert user data into the MySQL database
app.post('/register', upload.single('profilePicture'), (req, res) => {
  const { name, email, password, organization, device, cpu, gpu, ram, capacity, motherboard, psu } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  const query = `
   INSERT INTO users (name, email, password, organization, device, cpu, gpu, ram, capacity, motherboard, psu, profile_image)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [name, email, password, organization, device, cpu, gpu, ram, capacity, motherboard, psu, profilePicture], (err, results) => {
   if (err) {
    console.error('Error inserting data into the database:', err);
    return res.status(500).json({ error: 'Database error' });
   }

   res.status(200).json({ message: 'User registered successfully' });
  });
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

  const userQuery = `
    SELECT name, organization, cpu, gpu, email FROM users WHERE email = ?
  `;

  connection.query(userQuery, [email], (err, userResults) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (userResults.length > 0) {
      const user = userResults[0];
      const { cpu, gpu } = user;

      // Queries for avg_watt_usage for both CPU and GPU
      const cpuQuery = `SELECT avg_watt_usage FROM cpus WHERE model = ?`;
      const gpuQuery = `SELECT avg_watt_usage FROM gpus WHERE model = ?`;

      connection.query(cpuQuery, [cpu], (err, cpuResults) => {
        if (err) {
          console.error('Error querying CPU database:', err);
          return res.status(500).json({ error: 'CPU database error' });
        }

        connection.query(gpuQuery, [gpu], (err, gpuResults) => {
          if (err) {
            console.error('Error querying GPU database:', err);
            return res.status(500).json({ error: 'GPU database error' });
          }

          // Attach avg_watt_usage if found, else set as null
          user.cpu_avg_watt_usage = cpuResults[0]?.avg_watt_usage || null;
          user.gpu_avg_watt_usage = gpuResults[0]?.avg_watt_usage || null;

          res.status(200).json({ user });
        });
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

app.post('/user_history', authenticateToken, (req, res) => {
  const { organization, projectName, projectDescription, sessionDuration, carbonEmit, projectStage } = req.body;
  const userId = req.user.id; // Get the user ID from the authenticated token

  // Log the data being inserted
  console.log('Inserting session data:', {
    userId,
    organization,
    projectName,
    projectDescription,
    sessionDuration,
    carbonEmit,
    projectStage // Log the new field
  });

  const query = `
    INSERT INTO user_history (user_id, organization, project_name, project_description, session_duration, carbon_emit, stage)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [userId, organization, projectName, projectDescription, sessionDuration, carbonEmit, projectStage], (err, results) => {
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
    SELECT id, organization, project_name, project_description, session_duration, carbon_emit, stage FROM user_history WHERE user_id = ?
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json({ projects: results }); // Send back user's projects
  });
});

// Endpoint to update a project
app.put('/update_project/:id', authenticateToken, (req, res) => {
  const projectId = req.params.id; // Get project ID from request parameters
  const userId = req.user.id; // Get user ID from the authenticated token
  const { projectName, projectDescription, projectStage } = req.body; // Get project data from the request body

  const query = `
    UPDATE user_history 
    SET project_name = ?, project_description = ?, stage = ? 
    WHERE id = ? AND user_id = ?
  `;

  connection.query(query, [projectName, projectDescription, projectStage, projectId, userId], (err, results) => {
    if (err) {
      console.error('Error updating project in the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.affectedRows > 0) {
      res.status(200).json({ message: 'Project updated successfully' });
    } else {
      res.status(404).json({ error: 'Project not found or you do not have permission to update this project' });
    }
  });
});

app.post('/user_Update', authenticateToken, (req, res) => {
  const { projectName, projectDescription, sessionDuration, carbonEmissions, projectStage } = req.body;
  const userId = req.user.id; // Get the user ID from the authenticated token

  const query = `
    UPDATE user_history 
    SET session_duration = ?, carbon_emit = ?, stage = ?
    WHERE user_id = ? AND project_name = ?
  `;

  connection.query(
    query,
    [sessionDuration, carbonEmissions, projectStage, userId, projectName],
    (err, results) => {
      if (err) {
        console.error('Error updating session data in the database:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'No matching project found to update' });
      }

      res.status(200).json({ message: 'Session updated successfully' });
    }
  );
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

// Endpoint to find a project by name and description
app.post('/find_project', authenticateToken, (req, res) => {
  const { projectName, projectDescription } = req.body;
  const userId = req.user.id; // Get user ID from the authenticated token

  const query = `
    SELECT session_duration, id
    FROM user_history
    WHERE project_name = ? AND project_description = ? AND user_id = ?
  `;

  connection.query(query, [projectName, projectDescription, userId], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      // Project found, return session duration and project ID
      const project = results[0];
      res.status(200).json({
        session_duration: project.session_duration,
        project_id: project.id
      });
    } else {
      // No matching project found
      res.status(200).json(null);
    }
  });
});

// Endpoint to calculate carbon emissions for pc personal computer
app.post('/calculate_emissions', authenticateToken, async (req, res) => {
  const { sessionDuration } = req.body; // Get session duration from the request body
  const userId = req.user.id; // Get user ID from the authenticated token

  try {
      // Fetch user's CPU, GPU, RAM, and PSU details
      const userQuery = `SELECT cpu, gpu, ram, psu FROM users WHERE id = ?`;
      connection.query(userQuery, [userId], async (err, userResults) => {
          if (err) {
              console.error('Error fetching user details:', err);
              return res.status(500).json({ error: 'Database error' });
          }

          if (userResults.length === 0) {
              return res.status(404).json({ error: 'User not found' });
          }

          const { cpu, gpu, ram, psu } = userResults[0];

          // Fetch CPU, GPU, and RAM wattage
          const cpuResponse = await fetch(`http://localhost:5000/cpu_usage?model=${cpu}`);
          const gpuResponse = await fetch(`http://localhost:5000/gpu_usage?model=${gpu}`);
          const ramResponse = await fetch(`http://localhost:5000/ram_usage?model=${ram}`);

          if (cpuResponse.ok && gpuResponse.ok && ramResponse.ok) {
              const cpuData = await cpuResponse.json();
              const gpuData = await gpuResponse.json();
              const ramData = await ramResponse.json();

              const cpuWattUsage = cpuData.avg_watt_usage;
              const gpuWattUsage = gpuData.avg_watt_usage;
              const ramWattUsage = ramData.avg_watt_usage;

              // Add PSU wattage
              const psuWattUsage = psu; // Assuming 'psu' in the database stores the wattage directly

              // Calculate total power consumption (in kWh)
              const totalWattUsage = cpuWattUsage + gpuWattUsage + ramWattUsage + psuWattUsage;
              const totalEnergyUsed = (totalWattUsage * sessionDuration) / 3600; // kWh

              // Define carbon intensity (kg CO2/kWh)
              const CARBON_INTENSITY = 0.475; // Example value, adjust based on your region

              // Calculate carbon emissions
              const carbonEmissions = totalEnergyUsed * CARBON_INTENSITY; // in kg CO2e

              res.status(200).json({ carbonEmissions });
          } else {
              return res.status(500).json({ error: 'Error fetching wattage data' });
          }
      });
  } catch (error) {
      console.error('Error calculating carbon emissions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Check CPU watt usage for pc personal computer
app.get('/cpu_usage', (req, res) => {
  const { model } = req.query;
  const query = 'SELECT avg_watt_usage FROM cpus WHERE model = ?';
  
  connection.query(query, [model], (err, results) => {
    if (err) {
      console.error('Error querying CPU database:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      res.status(200).json({ avg_watt_usage: results[0].avg_watt_usage });
    } else {
      res.status(404).json({ error: 'CPU not found' });
    }
  });
});

// Check GPU watt usage for pc personal computer
app.get('/gpu_usage', (req, res) => {
  const { model } = req.query;
  const query = 'SELECT avg_watt_usage FROM gpus WHERE model = ?';
  
  connection.query(query, [model], (err, results) => {
    if (err) {
      console.error('Error querying GPU database:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      res.status(200).json({ avg_watt_usage: results[0].avg_watt_usage });
    } else {
      res.status(404).json({ error: 'GPU not found' });
    }
  });
});

// Endpoint to calculate carbon emissions for mobile or laptop
app.post('/calculate_emissionsM', authenticateToken, async (req, res) => {
  const { sessionDuration } = req.body; // Get session duration from the request body
  const userId = req.user.id; // Get user ID from the authenticated token

  try {
      // Fetch user's CPU and GPU details
      const userQuery = `SELECT cpu, gpu, ram FROM users WHERE id = ?`;
      connection.query(userQuery, [userId], async (err, userResults) => {
          if (err) {
              console.error('Error fetching user details:', err);
              return res.status(500).json({ error: 'Database error' });
          }

          if (userResults.length === 0) {
              return res.status(404).json({ error: 'User not found' });
          }

          const { cpu, gpu, ram} = userResults[0];

          // Fetch CPU and GPU wattage
          const cpuResponse = await fetch(`http://localhost:5000/cpum_usage?model=${cpu}`);
          const gpuResponse = await fetch(`http://localhost:5000/gpum_usage?model=${gpu}`);
          const ramResponse = await fetch(`http://localhost:5000/ram_usage?model=${ram}`);

          if (cpuResponse.ok && gpuResponse.ok) {
              const cpuData = await cpuResponse.json();
              const gpuData = await gpuResponse.json();
              const ramData = await ramResponse.json();

              const cpuWattUsage = cpuData.watts;
              const gpuWattUsage = gpuData.watts;
              const ramWattUsage = ramData.avg_watt_usage;

              // Calculate total power consumption (in kWh)
              const totalWattUsage = cpuWattUsage + gpuWattUsage + ramWattUsage;
              const totalEnergyUsed = (totalWattUsage * sessionDuration) / 3600; // kWh

              // Define carbon intensity (kg CO2/kWh)
              const CARBON_INTENSITY = 0.475; // Example value, adjust based on your region

              // Calculate carbon emissions
              const carbonEmissions = totalEnergyUsed * CARBON_INTENSITY; // in kg CO2e

              res.status(200).json({ carbonEmissions });
          } else {
              return res.status(500).json({ error: 'Error fetching wattage data' });
          }
      });
  } catch (error) {
      console.error('Error calculating carbon emissions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Check CPU watt usage for mobile or laptop
app.get('/cpum_usage', (req, res) => {
  const { model } = req.query;
  const query = 'SELECT watts FROM cpusm WHERE model = ?';
  
  connection.query(query, [model], (err, results) => {
    if (err) {
      console.error('Error querying CPU database:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      res.status(200).json({ watts: results[0].watts });
    } else {
      res.status(404).json({ error: 'CPUm not found' });
    }
  });
});

// Check GPU watt usage for mobile or laptop
app.get('/gpum_usage', (req, res) => {
  const { model } = req.query;
  const query = 'SELECT watts FROM gpusm WHERE model = ?';
  
  connection.query(query, [model], (err, results) => {
    if (err) {
      console.error('Error querying GPU database:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      res.status(200).json({ watts: results[0].watts });
    } else {
      res.status(404).json({ error: 'GPUm not found' });
    }
  });
});

// Check ram watt usage for mobile or laptop
app.get('/ram_usage', (req, res) => {
  const { model } = req.query;
  const query = 'SELECT avg_watt_usage FROM ram WHERE ddr_generation = ?';
  
  connection.query(query, [model], (err, results) => {
    if (err) {
      console.error('Error querying CPU database:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      res.status(200).json({ avg_watt_usage: results[0].avg_watt_usage });
    } else {
      res.status(404).json({ error: 'CPU not found' });
    }
  });
});

// Endpoints to fetch available CPU and GPU options
app.get('/cpu-options', (req, res) => {
  const query = 'SELECT manufacturer, series, model FROM cpus';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching GPU options:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Return an array of objects with optionString and model
    const cpuOptions = results.map(row => ({
      label: `${row.manufacturer} ${row.series} ${row.model}`, // Display string
      value: row.model // Unique model value
    }));

    res.status(200).json({ cpuOptions });
  });
});

app.get('/gpu-options', (req, res) => {
  const query = 'SELECT manufacturer, series, model FROM gpus';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching GPU options:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Return an array of objects with optionString and model
    const gpuOptions = results.map(row => ({
      label: `${row.manufacturer} ${row.series} ${row.model}`, // Display string
      value: row.model // Unique model value
    }));

    res.status(200).json({ gpuOptions });
  });
});

app.get('/cpu-options-mobile', (req, res) => {
  const query = 'SELECT generation, model FROM cpusm';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching CPUm options:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Return an array of objects with optionString and model
    const cpuOptions = results.map(row => ({
      label: `${row.generation} ${row.model}`, // Display string
      value: row.model // Unique model value
    }));

    res.status(200).json({ cpuOptions }); // Now matches frontend expectation
  });
});

app.get('/gpu-options-mobile', (req, res) => {
  const query = 'SELECT manufacturer, model FROM gpusm';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching GPUm options:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Return an array of objects with optionString and model
    const gpuOptions = results.map(row => ({
      label: `${row.manufacturer} ${row.model}`, // Display string
      value: row.model // Unique model value
    }));

    res.status(200).json({ gpuOptions }); // Now matches frontend expectation
  });
});

// Endpoint to fetch full user details including organization and device specifications for personal computer
app.get('/displayuser', authenticateToken, (req, res) => {
  const { email } = req.user;

  const userQuery = `
    SELECT name, email, organization, cpu, gpu, ram, motherboard, psu, profile_image
    FROM users 
    WHERE email = ?
  `;

  connection.query(userQuery, [email], (err, userResults) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (userResults.length > 0) {
      const user = userResults[0];
      const { cpu, gpu, ram, motherboard, psu } = user;

      // Queries for avg_watt_usage for both CPU and GPU
      const cpuQuery = `SELECT manufacturer, series, model, avg_watt_usage FROM cpus WHERE model = ?`;
      const gpuQuery = `SELECT manufacturer, series, model, avg_watt_usage FROM gpus WHERE model = ?`;

      connection.query(cpuQuery, [cpu], (err, cpuResults) => {
        if (err) {
          console.error('Error querying CPU database:', err);
          return res.status(500).json({ error: 'CPU database error' });
        }

        connection.query(gpuQuery, [gpu], (err, gpuResults) => {
          if (err) {
            console.error('Error querying GPU database:', err);
            return res.status(500).json({ error: 'GPU database error' });
          }

          // Create the specifications object
          const specifications = {
            CPU: cpuResults.length > 0 
              ? `${cpuResults[0].manufacturer} ${cpuResults[0].series} ${cpuResults[0].model}`
              : cpu,
            GPU: gpuResults.length > 0 
              ? `${gpuResults[0].manufacturer} ${gpuResults[0].series} ${gpuResults[0].model}`
              : gpu,
            CPU_avg_watt_usage: cpuResults[0]?.avg_watt_usage || null,
            GPU_avg_watt_usage: gpuResults[0]?.avg_watt_usage || null,
            RAM: ram,
            motherboard: motherboard,
            PSU: psu
          };

          res.status(200).json({ user: { ...user, specifications } });
        });
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// Endpoint to fetch full user details including organization and device specifications for mobile or laptop
app.get('/displayuserM', authenticateToken, (req, res) => {
  const { email } = req.user;

  const userQuery = `
    SELECT name, email, organization, cpu, gpu, ram, motherboard, psu, profile_image
    FROM users 
    WHERE email = ?
  `;

  connection.query(userQuery, [email], (err, userResults) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (userResults.length > 0) {
      const user = userResults[0];
      const { cpu, gpu, ram, motherboard, psu } = user;

      // Queries for avg_watt_usage for both CPU and GPU
      const cpuQuery = `SELECT generation, model, watts FROM cpusm WHERE model = ?`;
      const gpuQuery = `SELECT manufacturer, model, watts FROM gpusm WHERE model = ?`;

      connection.query(cpuQuery, [cpu], (err, cpuResults) => {
        if (err) {
          console.error('Error querying CPU database:', err);
          return res.status(500).json({ error: 'CPU database error' });
        }

        connection.query(gpuQuery, [gpu], (err, gpuResults) => {
          if (err) {
            console.error('Error querying GPU database:', err);
            return res.status(500).json({ error: 'GPU database error' });
          }

          // Create the specifications object
          const specifications = {
            CPU: cpuResults.length > 0 
              ? `${cpuResults[0].generation} ${cpuResults[0].model}`
              : cpu,
            GPU: gpuResults.length > 0 
              ? `${gpuResults[0].manufacturer} ${gpuResults[0].model}`
              : gpu,
            CPU_avg_watt_usage: cpuResults[0]?.watts || null,
            GPU_avg_watt_usage: gpuResults[0]?.watts || null,
            RAM: ram,
            motherboard: motherboard,
            PSU: psu
          };

          res.status(200).json({ user: { ...user, specifications } });
        });
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// Endpoint to check device type (Laptop or Personal Computer)
app.get('/checkDeviceType', authenticateToken, (req, res) => {
  const userId = req.user.id; // Get user ID from the authenticated token

  const query = `SELECT device FROM users WHERE id = ?`;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error querying device type from database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      const deviceType = results[0].device;
      res.status(200).json({ deviceType }); // Return the device type (Laptop or Personal Computer)
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

app.get('/organization_projects', authenticateToken, (req, res) => {
  const { organization } = req.query;

  const query = `
    SELECT uh.id, uh.project_name, uh.project_description, uh.session_duration, uh.carbon_emit, u.name AS owner
    FROM user_history uh
    JOIN users u ON uh.user_id = u.id
    WHERE uh.organization = ?
  `;

  connection.query(query, [organization], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json({ projects: results });
  });
});

// Endpoint to check the stage type (project)
app.post('/checkStageType', authenticateToken, (req, res) => {
  const { projectName, projectDescription } = req.body;
  const userId = req.user.id; // Get user ID from the authenticated token

  const query = `SELECT stage FROM user_history WHERE project_name = ? AND project_description = ? AND user_id = ?`;

  connection.query(query, [projectName, projectDescription, userId], (err, results) => {
    if (err) {
      console.error('Error querying stage type from database:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      const stageType = results[0].stage;
      res.status(200).json({ stageType }); // Return the stage type (project)
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  });
});

app.get('/ram-options', (req, res) => {
  const query = 'SELECT ddr_generation FROM ram';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching RAM options:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Create an array of RAM options
    const ramOptions = results.map(row => ({
      label: `${row.ddr_generation}`,
      value: row.ddr_generation.toString(),
    }));

    res.status(200).json({ ramOptions });
  });
});
