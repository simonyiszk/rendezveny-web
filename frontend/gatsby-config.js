const siteMetadata = {
  name: 'Rendezvény web - Simonyi Károly Szakkollégium',
  description: 'A Simonyi Károly Szakkollégium rendezvényeinek oldala.',
};

require('dotenv').config();

module.exports = {
  siteMetadata,
  plugins: [
    '@chakra-ui/gatsby-plugin',
    'gatsby-plugin-emotion',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        ...siteMetadata,
        display: 'minimal-ui',
        theme_color: '#663399',
        background_color: 'white',
        icon: 'src/assets/favicon.png',
        lang: 'en-US',
        start_url: '/',
      },
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-typescript',
    {
      resolve: `gatsby-plugin-create-client-paths`,
      options: { prefixes: [`/events/*`, `/manage/*`] },
    },
  ],
};
