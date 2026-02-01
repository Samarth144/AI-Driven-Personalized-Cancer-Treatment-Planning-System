const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/neuro_onco_ai', {
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('🐘 PostgreSQL Connected Successfully');
  } catch (error) {
    console.error(`❌ Unable to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };