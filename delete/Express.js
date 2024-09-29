const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mysql123!',
  database: 'users'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the HTML page
app.get('/', (req, res) => {
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Manage Users</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f4f4f4; }
        button { margin: 5px; }
      </style>
    </head>
    <body>
      <h1>Registered Users</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;

    results.forEach(user => {
      html += `
        <tr>
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>
            <form action="/edit" method="post" style="display:inline;">
              <input type="hidden" name="id" value="${user.id}">
              <button type="submit">Edit</button>
            </form>
            <form action="/delete" method="post" style="display:inline;">
              <input type="hidden" name="id" value="${user.id}">
              <button type="submit">Delete</button>
            </form>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    </body>
    </html>
    `;

    res.send(html);
  });
});

app.post('/edit', (req, res) => {
  const userId = req.body.id;
  res.send(`<h1>Edit user with ID: ${userId}</h1>`);
});

app.post('/delete', (req, res) => {
  const userId = req.body.id;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
