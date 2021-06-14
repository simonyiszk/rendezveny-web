import { Box } from '@chakra-ui/react';
import React from 'react';

export default function Footer(): JSX.Element {
  return (
    <Box py={2} px={[4, null, 8]} backgroundColor="simonyi" textAlign="right">
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
  );
}
