const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 500]
      }
    }
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, { foreignKey: 'userId' });
    Comment.belongsTo(models.BlogPost, { foreignKey: 'blogPostId' });
  };

  return Comment;
};