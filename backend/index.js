import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './database/db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Test database connection
sequelize.authenticate()
    .then(() => console.log('Database connected successfully.'))
    .catch(err => console.error('Unable to connect to the database:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
