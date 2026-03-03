import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
console.log(`Running in ${isTest ? 'TEST' : 'DEVELOPMENT'} mode.`);

const sequelize = new Sequelize(
    isTest ? process.env.TEST_DB_NAME : (process.env.DB_NAME || 'bidhisha_db'),
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

export default sequelize;
