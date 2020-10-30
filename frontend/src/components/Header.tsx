import { Box, Image, Link as ChakraLink } from '@chakra-ui/core';
import { Link } from 'gatsby';
import React from 'react';

import logoSmall from '../assets/images/simonyi_white_small.svg';
import logo from '../assets/images/simonyi_white_white.svg';

export default function Header(): JSX.Element {
  return (
    <Box p={1} backgroundColor="simonyi">
      <Link to="/">
        <Image
          display={['none', null, 'block']}
          height="2rem"
          src={logo}
          alt="Logo"
        />
        <Image
          display={['block', null, 'none']}
          height="3rem"
          m={1}
          src={logoSmall}
          alt="Logo"
        />
      </Link>
    </Box>
  );
}
