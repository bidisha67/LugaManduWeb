import request from 'supertest';
import app from '../index.js';
import sequelize from '../database/db.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import bcrypt from 'bcryptjs';

describe('Order API', () => {
    let adminToken = '';
    let userToken = '';
    let testProduct = null;
    let testOrder = null;

    beforeAll(async () => {
        // Force sync for testing
        await sequelize.sync({ force: true });

        // 1. Create Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await User.create({
            name: 'Admin Boss',
            email: 'admin_order@example.com',
            password: adminPassword,
            role: 'admin'
        });

        // 2. Create Regular User
        const userPassword = await bcrypt.hash('user123', 10);
        const regularUser = await User.create({
            name: 'Regular Customer',
            email: 'user_order@example.com',
            password: userPassword,
            role: 'customer'
        });

        // 3. Create a product to order
        testProduct = await Product.create({
            name: 'Test Shirt',
            price: 50.00,
            description: 'A cozy test shirt',
            image: 'shirt.jpg'
        });

        // 4. Login Admin
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin_order@example.com', password: 'admin123' });
        adminToken = adminLogin.body.token;

        // 5. Login User
        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user_order@example.com', password: 'user123' });
        userToken = userLogin.body.token;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should create a new order (Customer)', async () => {
        const orderData = {
            items: [
                {
                    id: testProduct.id,
                    name: testProduct.name,
                    price: testProduct.price,
                    quantity: 2,
                    image: testProduct.image
                }
            ],
            total: 100.00
        };

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send(orderData);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Order placed successfully');
        expect(parseFloat(res.body.order.total)).toBe(100);
        testOrder = res.body.order;
    });

    it('should get customer orders', async () => {
        const res = await request(app)
            .get('/api/orders/my-orders')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
    });

    it('should get all orders (Admin)', async () => {
        const res = await request(app)
            .get('/api/orders/all')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
    });

    it('should fetch dashboard stats (Admin)', async () => {
        const res = await request(app)
            .get('/api/orders/stats')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.totalOrders).toBe(1);
        expect(res.body.pendingOrders).toBe(1);
    });

    it('should not allow customer to mark order as completed', async () => {
        const res = await request(app)
            .put(`/api/orders/${testOrder.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ status: 'completed' });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Unauthorized');
    });

    it('should allow admin to mark order as completed', async () => {
        const res = await request(app)
            .put(`/api/orders/${testOrder.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'completed' });

        expect(res.status).toBe(200);
        expect(res.body.order.status).toBe('completed');
    });

    it('should update revenue stats after completion', async () => {
        const res = await request(app)
            .get('/api/orders/stats')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(parseFloat(res.body.totalRevenue)).toBe(100);
    });
});
