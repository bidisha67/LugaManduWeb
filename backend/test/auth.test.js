import request from 'supertest';
import app from '../index.js';
import sequelize from '../database/db.js';

describe('Authentication API', () => {
    // Sync database before tests
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    // Close connection after tests
    afterAll(async () => {
        await sequelize.close();
    });

    const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        role: 'customer'
    };

    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User registered successfully');
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(testUser.email);
    });

    it('should login and return a JWT token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Login successful');
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'password123'
            });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

    it('should return 400 for incorrect password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid credentials');
    });
});
