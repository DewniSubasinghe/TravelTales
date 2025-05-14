const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BlogPost = sequelize.define('BlogPost', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 100]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 5000]
      }
    },
    countryName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    visitDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true
    }
  });

  BlogPost.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    if (this.Likes) {
      values.likeCount = this.Likes.filter(l => l.type === 'like').length;
      values.dislikeCount = this.Likes.filter(l => l.type === 'dislike').length;
    } else {
      values.likeCount = 0;
      values.dislikeCount = 0;
    }
    
    if (this.Comments) {
      values.commentCount = this.Comments.length;
    } else {
      values.commentCount = 0;
    }
    
    return values;
  };

  BlogPost.associate = (models) => {
    BlogPost.belongsTo(models.User, { foreignKey: 'userId' });
    BlogPost.hasMany(models.Comment, { foreignKey: 'blogPostId' });
    BlogPost.hasMany(models.Like, { foreignKey: 'blogPostId' });
  };

  return BlogPost;
};