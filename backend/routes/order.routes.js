import express from 'express';
import orderController from '../controllers/order.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Customer & Admin routes
router.get('/my-orders', authMiddleware, orderController.getMyOrders);
router.post('/', authMiddleware, orderController.createOrder);
router.put('/:id', authMiddleware, orderController.updateOrderStatus);

// Admin only routes
router.get('/all', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.get('/stats', authMiddleware, adminMiddleware, orderController.getDashboardStats);

export default router;
