const request = require('supertest');
const mysql = require('mysql');

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Mock mysql
jest.mock('mysql');

describe('User API Endpoints', () => {
  let app, mockConnection;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a mock connection
    mockConnection = {
      connect: jest.fn((callback) => callback(null)),
      query: jest.fn()
    };
    
    // Mock the createConnection method
    mysql.createConnection.mockReturnValue(mockConnection);
    
    // Clear the module cache to ensure a fresh import
    jest.resetModules();
    
    // Import the app module (this needs to happen after mocking)
    app = require('../app');
  });
  
  afterEach(() => {
    // Clear the module cache after each test to ensure a fresh import
    jest.resetModules();
  });
  
  describe('GET /get-users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' }
      ];
      
      // Mock the db.query implementation for this test
      mockConnection.query.mockImplementation((query, callback) => {
        callback(null, mockUsers);
      });
      
      const response = await request(app).get('/get-users');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
    });
    
    it('should handle database errors', async () => {
      // Mock a database error
      mockConnection.query.mockImplementation((query, callback) => {
        callback(new Error('Database error'));
      });
      
      await expect(request(app).get('/get-users')).rejects.toThrow();
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
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
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(null, { insertId: 1 });
      });
      
      const response = await request(app)
        .post('/add-user')
        .send(newUser);
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('User added successfully');
      expect(mockConnection.query).toHaveBeenCalledWith(
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
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(new Error('Database error'));
      });
      
      await expect(request(app).post('/add-user').send(newUser)).rejects.toThrow();
      expect(mockConnection.query).toHaveBeenCalledWith(
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
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(null, { affectedRows: 1 });
      });
      
      const response = await request(app)
        .put(`/update-user/${userId}`)
        .send(updatedUser);
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('User updated successfully');
      expect(mockConnection.query).toHaveBeenCalledWith(
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
      mockConnection.query.mockImplementation((query, values, callback) => {
        callback(new Error('Database error'));
      });
      
      await expect(request(app).put(`/update-user/${userId}`).send(updatedUser)).rejects.toThrow();
      expect(mockConnection.query).toHaveBeenCalledWith(
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
  });
  
  describe('DELETE /delete-user/:id', () => {
    it('should delete a user', async () => {
      const userId = 1;
      
      // Mock the db.query implementation for this test
      mockConnection.query.mockImplementation((query, value, callback) => {
        callback(null, { affectedRows: 1 });
      });
      
      const response = await request(app).delete(`/delete-user/${userId}`);
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('User deleted successfully');
      expect(mockConnection.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', userId, expect.any(Function));
    });
    
    it('should handle database errors when deleting a user', async () => {
      const userId = 1;
      
      // Mock a database error
      mockConnection.query.mockImplementation((query, value, callback) => {
        callback(new Error('Database error'));
      });
      
      await expect(request(app).delete(`/delete-user/${userId}`)).rejects.toThrow();
      expect(mockConnection.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', userId, expect.any(Function));
    });
  });
});
