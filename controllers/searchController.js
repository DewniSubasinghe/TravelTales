const { BlogPost, User, Like, Comment } = require('../models');
const axios = require('axios');
const { Op } = require('sequelize');
const { getCountryData } = require('../utils/helpers');

module.exports = {
  searchPosts: async (req, res) => {
    try {
      const { query, country, author, sort } = req.query;
     
      let where = {};
      let include = [{
        model: User,
        attributes: ['id', 'username'],
        required: false
      }];

      if (country) {
        where.countryName = country;
      }

      if (author) {
        include[0].where = { 
          [Op.or]: [
            { username: { [Op.like]: `%${author}%` } },
            { email: { [Op.like]: `%${author}%` } }
          ]
        };
      }

      if (query) {
        where[Op.or] = [
          { title: { [Op.like]: `%${query}%` } },
          { content: { [Op.like]: `%${query}%` } }
        ];
      }

      let order = [['createdAt', 'DESC']];
      if (sort === 'popular') {
        order = [[Like, 'id', 'DESC']];
      } else if (sort === 'commented') {
        order = [[Comment, 'id', 'DESC']];
      }

      const posts = await BlogPost.findAll({
        where,
        include: [
          ...include,
          {
            model: Like,
            attributes: ['id', 'type']
          },
          {
            model: Comment,
            attributes: ['id']
          }
        ],
        order
      });

      const processedPosts = posts.map(post => {
        const postJson = post.get({ plain: true });
        const likes = postJson.Likes ? postJson.Likes.filter(l => l.type === 'like').length : 0;
        const dislikes = postJson.Likes ? postJson.Likes.filter(l => l.type === 'dislike').length : 0;
        
        return {
          ...postJson,
          User: postJson.User || { id: 0, username: 'Unknown' },
          likeCount: likes,
          dislikeCount: dislikes,
          commentCount: postJson.Comments ? postJson.Comments.length : 0
        };
      });

      let countries = [];
      let countryData = null;
     
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        countries = response.data.map(c => c.name.common).sort();
       
        if (country) {
          countryData = await getCountryData(country) || {
            flag: '',
            capital: 'Unknown',
            currencies: ['Unknown'],
            region: 'Unknown'
          };
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        countries = [];
      }

      res.render('search', {
        title: 'Search Results',
        posts: processedPosts,
        countries,
        countryData,
        query: query || '',
        country: country || '',
        author: author || '',
        sort: sort || 'newest',
        user: req.user
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Search failed'
      });
    }
  }
};