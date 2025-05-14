const sequelize = require('../models/db');
const User = require('../models/User');

async function setup() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database tables created!');
    
    // Create test user
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Test user created');
  } catch (err) {
    console.error('Setup failed:', err);
  } finally {
    await sequelize.close();
  }
}

setup();