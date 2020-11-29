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
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXAiOiJhY2Nlc3MiLCJ1aWQiOiIyNTcyMmRjMy0zMGIxLTRlN2QtOGNiNy05MmRhYTgzZGUxOTgiLCJyb2wiOjEsImNsYiI6W10sImlhdCI6MTYwNTM1MTkyOCwiZXhwIjoxNjA1MzUyMjI4fQ.DU2_EX2yTPfdS5Y3UzKARRh2rgy9fWph1zKO7Vqw4Qg',
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
