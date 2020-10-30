import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import { Helmet } from 'react-helmet';

import Header from './Header';
import Footer from './Footer';
import { Box, Flex } from '@chakra-ui/core';

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

      <Flex flexDir="column" height="100vh" boxSizing="border-box">
        <header>
          <Header />
        </header>

        <Box as="main" flexGrow={1}>{children}</Box>

        <footer>
          <Footer />
        </footer>
      </Flex>
    </React.StrictMode>
  );
}
