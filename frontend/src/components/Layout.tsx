import { Box, CSSReset, Flex } from '@chakra-ui/core';
import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import { Helmet } from 'react-helmet';

import Footer from './Footer';
import Header from './Header';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): JSX.Element {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          name
          description
        }
      }
    }
  `);

  return (
    <React.StrictMode>
      <Helmet
        titleTemplate={`%s - ${data.site.siteMetadata.name}`}
        defaultTitle={data.site.siteMetadata.name}
      >
        <meta name="description" content={data.site.siteMetadata.description} />
      </Helmet>

      <Flex flexDir="column" height="100vh">
        <header>
          <Header />
        </header>

        <Box
          as="main"
          py={['1rem', null, '2rem']}
          px={['1rem', null, '6rem']}
          flexGrow={1}
        >
          {children}
        </Box>

        <footer>
          <Footer />
        </footer>
      </Flex>
    </React.StrictMode>
  );
}
