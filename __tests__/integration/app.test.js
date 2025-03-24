const request = require('supertest');

const express = require('express');

const bodyParser = require('body-parser');

const mysql = require('mysql');
 
jest.mock('mysql');
 
const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
 
const db = {

  query: jest.fn(),

  connect: jest.fn()

};

mysql.createConnection.mockReturnValue(db);
 
// Routes

app.get('/get-users', (req, res) => {

  db.query('SELECT * FROM users', (err, results) => {

    if (err) throw err;

    res.json(results);

  });

});
 
app.post('/add-user', (req, res) => {

  const { designation, email, first_name, is_admin, last_name, middle_name, phone_number, previous_exp } = req.body;

  const sql = 'INSERT INTO users (designation, email, first_name, is_admin, last_name, middle_name, phone_number, previous_exp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  const values = [designation, email, first_name, is_admin, last_name, middle_name, phone_number, previous_exp];

  db.query(sql, values, (err, result) => {

    if (err) throw err;

    res.send('User added successfully');

  });

});
 
app.put('/update-user/:id', (req, res) => {

  const userId = req.params.id;

  const { designation, email, first_name, is_admin, last_name, middle_name, phone_number, previous_exp } = req.body;

  const sql = 'UPDATE users SET designation=?, email=?, first_name=?, is_admin=?, last_name=?, middle_name=?, phone_number=?, previous_exp=? WHERE id = ?';

  const values = [designation, email, first_name, is_admin, last_name, middle_name, phone_number, previous_exp, userId];

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
 
describe('API Endpoints', () => {

  beforeEach(() => {

    jest.clearAllMocks();

  });
 
  describe('GET /get-users', () => {

    it('should return list of users', async () => {

      const mockUsers = [{ id: 1, first_name: 'John', last_name: 'Doe' }];

      db.query.mockImplementationOnce((query, callback) => {

        callback(null, mockUsers);

      });
 
      const res = await request(app).get('/get-users').expect(200);

      expect(res.body).toEqual(mockUsers);

    });
 
    it('should handle errors', async () => {

      db.query.mockImplementationOnce((query, callback) => {

        callback(new Error('Database error'));

      });
 
      const res = await request(app).get('/get-users').expect(500);

      expect(res.text).toContain('Database error');

    });

  });
 
  describe('POST /add-user', () => {

    const userData = {

      designation: 'Developer',

      email: 'john@example.com',

      first_name: 'John',

      is_admin: 0,

      last_name: 'Doe',

      middle_name: 'M',

      phone_number: '1234567890',

      previous_exp: '2 years'

    };
 
    it('should add a new user successfully', async () => {

      db.query.mockImplementationOnce((query, values, callback) => {

        callback(null, { insertId: 1 });

      });
 
      const res = await request(app).post('/add-user').send(userData).expect(200);

      expect(res.text).toBe('User added successfully');

    });
 
    it('should handle errors when adding user', async () => {

      db.query.mockImplementationOnce((query, values, callback) => {

        callback(new Error('Database error'));

      });
 
      const res = await request(app).post('/add-user').send(userData).expect(500);

      expect(res.text).toContain('Database error');

    });

  });
 
  describe('PUT /update-user/:id', () => {

    const userData = {

      designation: 'Senior Developer',

      email: 'john.doe@example.com',

      first_name: 'John',

      is_admin: 1,

      last_name: 'Doe',

      middle_name: 'M',

      phone_number: '9876543210',

      previous_exp: '5 years'

    };

    const userId = '1';
 
    it('should update a user successfully', async () => {

      db.query.mockImplementationOnce((query, values, callback) => {

        callback(null, { affectedRows: 1 });

      });
 
      const res = await request(app).put(`/update-user/${userId}`).send(userData).expect(200);

      expect(res.text).toBe('User updated successfully');

    });
 
    it('should handle errors when updating user', async () => {

      db.query.mockImplementationOnce((query, values, callback) => {

        callback(new Error('Database error'));

      });
 
      const res = await request(app).put(`/update-user/${userId}`).send(userData).expect(500);

      expect(res.text).toContain('Database error');

    });

  });
 
  describe('DELETE /delete-user/:id', () => {

    const userId = '1';
 
    it('should delete a user successfully', async () => {

      db.query.mockImplementationOnce((query, values, callback) => {

        callback(null, { affectedRows: 1 });

      });
 
      const res = await request(app).delete(`/delete-user/${userId}`).expect(200);

      expect(res.text).toBe('User deleted successfully');

    });
 
    it('should handle errors when deleting user', async () => {

      db.query.mockImplementationOnce((query, values, callback) => {

        callback(new Error('Database error'));

      });
 
      const res = await request(app).delete(`/delete-user/${userId}`).expect(500);

      expect(res.text).toContain('Database error');

    });

  });

});
 
