import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './database/db.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';

// Models for syncing
import './models/user.model.js';
import './models/product.model.js';
import './models/order.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// DEBUG CORS MIDDLEWARE
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Origin: ${origin}`);

    // Set headers manually to ensure they are present even on errors
    res.setHeader('Access-Control-Allow-Origin', origin || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        console.log(`[${new Date().toLocaleTimeString()}] Handled Preflight (OPTIONS)`);
        return res.status(200).end();
    }
    next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const PORT = process.env.PORT || 5005;

app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Test database connection and sync
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');
    } catch (err) {
        console.error('Unable to connect/sync the database:', err.message);
        console.log('Continuing server startup without database connection...');
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`CORS allowed origin: http://localhost:5173`);
    });
};

startServer();




