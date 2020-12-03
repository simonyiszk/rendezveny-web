import { Flex, Spinner } from '@chakra-ui/core';
import React from 'react';

import { Layout } from './Layout';

export default function Loading(): JSX.Element {
  return (
    <Layout>
      <Flex
        width="100%"
        height="80vh"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="10rem" color="simonyi" thickness="1rem" speed="1s">
          Loading
        </Spinner>
      </Flex>
    </Layout>
  );
}
