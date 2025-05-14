const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Ensure db directory exists
const dbPath = path.join(__dirname, '../db');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dbPath, 'database.sqlite'),
  logging: false,
  define: {
    freezeTableName: true
  }
});

// Import model definitions
const User = require('./User')(sequelize);
const BlogPost = require('./BlogPost')(sequelize);
const Comment = require('./Comment')(sequelize);
const Like = require('./Like')(sequelize);
const Follow = require('./Follow')(sequelize);

// Set up associations
User.associate({ BlogPost, Comment, Like, Follow, User });
BlogPost.associate({ User, Comment, Like });
Comment.associate({ User, BlogPost });
Like.associate({ User, BlogPost });
Follow.associate({ User });

// Test connection and sync
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    // Use { force: true } only for development when need to reset the database
    return sequelize.sync({ alter: false });
  })
  .then(() => console.log('Database synced'))
  .catch(err => {
    console.error('Database error:', err);
    // Try syncing without altering if the first attempt fails
    return sequelize.sync();
  })
  .then(() => console.log('Database finally synced'))
  .catch(err => console.error('Final database sync error:', err));

module.exports = {
  sequelize,
  User,
  BlogPost,
  Comment,
  Like,
  Follow
};