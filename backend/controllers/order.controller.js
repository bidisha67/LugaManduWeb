import Order from '../models/order.model.js';
import User from '../models/user.model.js';

const createOrder = async (req, res) => {
    try {
        const { items, total } = req.body;
        const order = await Order.create({
            userId: req.user.id,
            items,
            total,
            status: 'pending'
        });
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only admin can mark as completed, customer can only cancel pending orders
        if (req.user.role !== 'admin' && status === 'completed') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (status === 'cancelled' && order.status !== 'pending' && req.user.role !== 'admin') {
            return res.status(400).json({ message: 'Cannot cancel order that is already processed' });
        }

        await order.update({ status });
        res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalOrders = await Order.count();
        const completedOrders = await Order.count({ where: { status: 'completed' } });
        const pendingOrders = await Order.count({ where: { status: 'pending' } });
        const totalRevenue = await Order.sum('total', { where: { status: 'completed' } }) || 0;

        res.status(200).json({
            totalUsers,
            totalOrders,
            completedOrders,
            pendingOrders,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

export default {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getDashboardStats
};
