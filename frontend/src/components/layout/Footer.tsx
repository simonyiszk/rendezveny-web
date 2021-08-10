import { Box, Flex } from '@chakra-ui/react';
import React from 'react';

export default function Footer(): JSX.Element {
  return (
    <Flex
      py={2}
      px={[4, null, 8]}
      backgroundColor="simonyi"
      justifyContent="space-between"
      flexDirection={['column', null, 'row']}
      alignItems="center"
    >
      <Box textAlign="center">
        <Box
          as="a"
          fontWeight="bold"
          href="https://simonyi.bme.hu"
          target="_blank"
          rel="noreferrer"
        >
          Simonyi Károly Szakkollégium
        </Box>{' '}
        - 2021
      </Box>
      <Box
        as="a"
        fontWeight="bold"
        href="https://github.com/simonyiszk/rendezveny-web"
        target="_blank"
        rel="noreferrer"
      >
        v0.2.2-beta
      </Box>
    </Flex>
  );
}
