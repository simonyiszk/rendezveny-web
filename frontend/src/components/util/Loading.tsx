import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';

import { Layout } from '../layout/Layout';

export default function Loading(): JSX.Element {
  return (
    <Layout>
      <Flex
        width="100%"
        height="80vh"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner boxSize="10rem" color="simonyi" thickness="1rem" speed="1s" />
      </Flex>
    </Layout>
  );
}
