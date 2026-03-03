import request from 'supertest';
import app from '../index.js';
import sequelize from '../database/db.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

describe('Product API', () => {
    let adminToken = '';
    let testProduct = null;

    beforeAll(async () => {
        // Force sync for testing
        await sequelize.sync({ force: true });

        // Create an admin user for testing
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin_test@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        // Login as admin
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: adminUser.email,
                password: 'admin123'
            });

        adminToken = loginRes.body.token;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should create a new product (Admin)', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('name', 'Test Product')
            .field('price', 99.99)
            .field('description', 'Test Description')
            .attach('image', 'test/dummy.jpg');

        expect(res.status).toBe(201);
        expect(res.body.product.name).toBe('Test Product');
        testProduct = res.body.product;
    });

    it('should get all products', async () => {
        const res = await request(app).get('/api/products');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should update a product (Admin)', async () => {
        const res = await request(app)
            .put(`/api/products/${testProduct.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .field('name', 'Updated Product')
            .field('price', 149.99);

        expect(res.status).toBe(200);
        expect(res.body.product.name).toBe('Updated Product');
        expect(res.body.product.price).toBe('149.99');
    });

    it('should delete a product (Admin)', async () => {
        const res = await request(app)
            .delete(`/api/products/${testProduct.id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Product deleted successfully');
    });
});
