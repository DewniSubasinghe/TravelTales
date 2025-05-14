const axios = require('axios');

const getCountryData = async (countryName) => {
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
   
    if (!response.data || response.data.length === 0) {
      console.error('No country data found for:', countryName);
      return null;
    }

    const country = response.data[0];
   
    let flagUrl = '';
    if (country.flags?.png) {
      flagUrl = country.flags.png.replace('http://', 'https://');
    } else if (country.flags?.svg) {
      flagUrl = country.flags.svg.replace('http://', 'https://');
    }

    return {
      flag: flagUrl,
      currencies: country.currencies ? Object.values(country.currencies).map(c => c.name) : ['Unknown'],
      capital: country.capital?.[0] || 'Unknown',
      region: country.region || 'Unknown',
      subregion: country.subregion || 'Unknown',
      languages: country.languages ? Object.values(country.languages) : ['Unknown'],
    };
  } catch (error) {
    console.error('Error fetching country data:', error.message);
    return {
      flag: '',
      currencies: ['Unknown'],
      capital: 'Unknown',
      region: 'Unknown',
      subregion: 'Unknown',
      languages: ['Unknown']
    };
  }
};

module.exports = {
  getCountryData
};