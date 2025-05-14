const { sequelize } = require('../models/db');

async function resetDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();