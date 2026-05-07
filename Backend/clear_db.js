const { sequelize } = require('./config/db');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Analysis = require('./models/Analysis');
const TreatmentPlan = require('./models/TreatmentPlan');
const OutcomePrediction = require('./models/OutcomePrediction');

const clearDB = async () => {
  try {
    console.log('🐘 Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully.');
    
    console.log('🧹 Clearing database (dropping and recreating tables)...');
    await sequelize.sync({ force: true });
    console.log('✨ Database cleared and tables recreated successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearDB();
