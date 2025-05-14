const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Like = sequelize.define('Like', {
    type: {
      type: DataTypes.ENUM('like', 'dislike'),
      allowNull: false,
      defaultValue: 'like'
    }
  });

  Like.associate = (models) => {
    Like.belongsTo(models.User, { foreignKey: 'userId' });
    Like.belongsTo(models.BlogPost, { foreignKey: 'blogPostId' });
  };

  return Like;
};