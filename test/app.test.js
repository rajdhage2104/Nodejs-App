const request = require('supertest');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Mock mysql
jest.mock('mysql');

// Import the app.js file - this assumes app.js exports the app
// If it doesn't, you'll need to modify your app.js to export the app
// For testing purposes, we'll recreate the app here
const createApp = () => {
  const app = express();
  
  // Mock db connection
  const db = {
    connect: jest.fn((callback) => callback(null)),
    query: jest.fn()
  };
  
  mysql.createConnection.mockReturnValue(db);
  
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

  return { app, db };
};

describe('User API Endpoints', () => {
  let app, db;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    const appObj = createApp();
    app = appObj.app;
    db = appObj.db;
  });
  
  describe('GET /get-users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' }
      ];
      
      // Mock the db.query implementation for this test
      db.query.mockImplementation((query, callback) => {
        callback(null, mockUsers);
      });
      
      const response = await request(app).get('/get-users');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
    });
    
    it('should handle database errors', async () => {
      // Mock a database error
      db.query.mockImplementation((query, callback) => {
        callback(new Error('Database error'));
      });
      
      await expect(request(app).get('/get-users')).rejects.toThrow();
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
    });
  });
  
  describe('POST /add-user', () => {
    it('should add a new user', async () => {
      const newUser = {
        designation: 'Developer',
        email: 'john@example.com',
        first_name: 'John',
        is_admin: 0,
        last_name: 'Doe',
        middle_name: '',
        phone_number: '1234567890',
        previous_exp: '2 years'
      };
      
      // Mock the db.query implementation for this test
      db.query.mockImplementation((query, values, callback) => {
        callback(null, { insertId: 1 });
      });
      
      const response = await request(app)
        .post('/add-user')
        .send(newUser);
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('User added successfully');
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO users (designation, email, first_name, is_admin, last_name, middle_name, phone_number, previous_exp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          newUser.designation,
          newUser.email,
          newUser.first_name,
          newUser.is_admin,
          newUser.last_name,
          newUser.middle_name,
          newUser.phone_number,
          newUser.previous_exp
        ],
        expect.any(Function)
      );
    });
    
    it('should handle database errors when adding a user', async () => {
      const newUser = {
        designation: 'Developer',
        email: 'john@example.com',
        first_name: 'John',
        is_admin: 0,
        last_name: 'Doe',
        middle_name: '',
        phone_number: '1234567890',
        previous_exp: '2 years'
      };
      
      // Mock a database error
      db.query.mockImplementation((query, values, callback) => {
        callback(new Error('Database error'));
      });
      
      await expect(request(app).post('/add-user').send(newUser)).rejects.toThrow();
    });
  });
  
  describe('PUT /update-user/:id', () => {
    it('should update an existing user', async () => {
      const userId = 1;
      const updatedUser = {
        designation: 'Senior Developer',
        email: 'john.updated@example.com',
        first_name: 'John',
        is_admin: 1,
        last_name: 'Doe',
        middle_name: 'M',
        phone_number: '9876543210',
        previous_exp: '5 years'
      };
      
      // Mock the db.query implementation for this test
      db.query.mockImplementation((query, values, callback) => {
        callback(null, { affectedRows: 1 });
      });
      
      const response = await request(app)
        .put(`/update-user/${userId}`)
        .send(updatedUser);
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('User updated successfully');
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE users SET designation=?, email=?, first_name=?, is_admin=?, last_name=?, middle_name=?, phone_number=?, previous_exp=? WHERE id = ?',
        [
          updatedUser.designation,
          updatedUser.email,
          updatedUser.first_name,
          updatedUser.is_admin,
          updatedUser.last_name,
          updatedUser.middle_name,
          updatedUser.phone_number,
          updatedUser.previous_exp,
          userId
        ],
        expect.any(Function)
      );
    });
    
    it('should handle database errors when updating a user', async () => {
      const userId = 1;
      const updatedUser = {
        designation: 'Senior Developer',
        email: 'john.updated@example.com',
        first_name: 'John',
        is_admin: 1,
        last_name: 'Doe',
        middle_name: 'M',
        phone_number: '9876543210',
        previous_exp: '5 years'
      };
      
      // Mock a database error
      db.query.mockImplementation((query, values, callback) => {
        callback(new Error('Database error'));
      });
      
      await expect(request(app).put(`/update-user/${userId}`).send(updatedUser)).rejects.toThrow();
    });
  });
  
  describe('DELETE /delete-user/:id', () => {
    it('should delete a user', async () => {
      const userId = 1;
      
      // Mock the db.query implementation for this test
      db.query.mockImplementation((query, value, callback) => {
        callback(null, { affectedRows: 1 });
      });
      
      const response = await request(app).delete(`/delete-user/${userId}`);
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('User deleted successfully');
      expect(db.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', userId, expect.any(Function));
    });
    
    it('should handle database errors when deleting a user', async () => {
      const userId = 1;
      
      // Mock a database error
      db.query.mockImplementation((query, value, callback) => {
        callback(new Error('Database error'));
      });
      
      await expect(request(app).delete(`/delete-user/${userId}`)).rejects.toThrow();
    });
  });
});
