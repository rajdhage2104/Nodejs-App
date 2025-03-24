const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// Create express app
const app = express();

// MySQL connection configuration - moved to a function to make it testable
const createDbConnection = () => {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || 'microservice-db.cvggya6kg1r7.us-east-1.rds.amazonaws.com',
    user: process.env.MYSQL_USER || 'admin',
    password: process.env.MYSQL_PASSWORD || 'admin123',
    database: process.env.MYSQL_DATABASE || 'todoappdb',
  });
};

// Create the database connection
const db = createDbConnection();

// Connect to MySQL
if (process.env.NODE_ENV !== 'test') {
  db.connect((err) => {
    if (err) {
      console.error('MySQL connection error:', err);
    } else {
      console.log('Connected to MySQL');
    }
  });
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/get-users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/add-user', (req, res) => {
  const {
    designation,
    email,
    first_name,
    is_admin,
    last_name,
    middle_name,
    phone_number,
    previous_exp
  } = req.body;

  const sql =
    'INSERT INTO users (designation, email, first_name, is_admin, last_name, middle_name, phone_number, previous_exp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  const values = [
    designation,
    email,
    first_name,
    is_admin,
    last_name,
    middle_name,
    phone_number,
    previous_exp
  ];

  db.query(sql, values, (err, result) => {
    if (err) throw err;
    res.send('User added successfully');
  });
});

app.put('/update-user/:id', (req, res) => {
  const userId = req.params.id;
  const {
    designation,
    email,
    first_name,
    is_admin,
    last_name,
    middle_name,
    phone_number,
    previous_exp
  } = req.body;

  const sql =
    'UPDATE users SET designation=?, email=?, first_name=?, is_admin=?, last_name=?, middle_name=?, phone_number=?, previous_exp=? WHERE id = ?';

  const values = [
    designation,
    email,
    first_name,
    is_admin,
    last_name,
    middle_name,
    phone_number,
    previous_exp,
    userId
  ];

  db.query(sql, values, (err, result) => {
    if (err) throw err;
    res.send('User updated successfully');
  });
});

app.delete('/delete-user/:id', (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', userId, (err, result) => {
    if (err) throw err;
    res.send('User deleted successfully');
  });
});

// Export the app and db for testing
module.exports = { app, db, createDbConnection };

// Only start the server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
