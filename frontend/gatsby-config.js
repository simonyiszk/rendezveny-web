const siteMetadata = {
  name: 'Gatsby Strict Starter',
  description:
    'Demo for a Gatsby starter with strict linting and auto-formatting rules.',
};

module.exports = {
  siteMetadata,
  plugins: [
    'gatsby-plugin-chakra-ui',
    'gatsby-plugin-emotion',
    {
      resolve: `gatsby-source-graphql`,
      options: {
        typeName: `ApiV1Module`,
        fieldName: `apiv1`,
        url: `http://localhost:3000/api/v1`,
        headers: {
          Authorization: `Bearer x`,
        },
      },
    },
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
  ],
};
