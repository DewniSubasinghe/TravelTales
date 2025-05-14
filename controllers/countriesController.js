const axios = require('axios');
const { BlogPost, User, Like, Comment } = require('../models');

const getCountryDetails = async (countryName) => {
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
    if (!response.data || response.data.length === 0) return null;
    
    const country = response.data[0];
    return {
      name: country.name.common,
      flag: country.flags?.png || '',
      capital: country.capital?.[0] || 'Unknown',
      currencies: country.currencies ? Object.values(country.currencies).map(c => c.name) : ['Unknown'],
      languages: country.languages ? Object.values(country.languages) : ['Unknown'],
      region: country.region || 'Unknown',
      subregion: country.subregion || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching country data:', error);
    return null;
  }
};

exports.showCountry = async (req, res) => {
  try {
    const countryName = req.params.name;
    const countryData = await getCountryDetails(countryName) || {
      name: countryName,
      flag: '',
      capital: 'Unknown',
      currencies: ['Unknown'],
      languages: ['Unknown'],
      region: 'Unknown',
      subregion: 'Unknown'
    };

    // Get posts for this country
    const posts = await BlogPost.findAll({
      where: { countryName },
      include: [
        { model: User, attributes: ['id', 'username', 'profilePicture'] },
        { model: Like, attributes: ['id'] },
        { model: Comment, attributes: ['id'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const postsWithCounts = posts.map(post => ({
      ...post.toJSON(),
      likeCount: post.Likes ? post.Likes.length : 0,
      commentCount: post.Comments ? post.Comments.length : 0
    }));

    res.render('countries/show', {
      title: `Posts about ${countryName}`,
      countryName,
      countryData,
      posts: postsWithCounts,
      user: req.user
    });
  } catch (error) {
    console.error('Error getting country posts:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load country information'
    });
  }
};