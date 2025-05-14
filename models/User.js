const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100] // Minimum 6 characters
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    User.hasMany(models.BlogPost, { foreignKey: 'userId' });
    User.hasMany(models.Comment, { foreignKey: 'userId' });
    User.hasMany(models.Like, { foreignKey: 'userId' });
    User.belongsToMany(models.User, {
      through: models.Follow,
      as: 'Following',
      foreignKey: 'followerId'
    });
    User.belongsToMany(models.User, {
      through: models.Follow,
      as: 'Followers',
      foreignKey: 'followingId'
    });
  };

  return User;
};