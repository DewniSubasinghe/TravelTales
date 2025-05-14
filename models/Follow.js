const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Follow = sequelize.define('Follow', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['followerId', 'followingId']
      }
    ]
  });

  Follow.associate = function(models) {
    Follow.belongsTo(models.User, { as: 'Follower', foreignKey: 'followerId' });
    Follow.belongsTo(models.User, { as: 'Following', foreignKey: 'followingId' });
  };

  return Follow;
};