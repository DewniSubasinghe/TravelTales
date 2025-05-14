const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../db');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dbPath, 'database.sqlite'),
  logging: console.log,
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

// Test connection and sync with alter: true for schema updates
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    return sequelize.sync({ alter: true }); // Changed from force: true to alter: true
  })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Database error:', err));

module.exports = {
  sequelize,
  User,
  BlogPost,
  Comment,
  Like,
  Follow
};