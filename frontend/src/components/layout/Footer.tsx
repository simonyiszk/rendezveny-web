import { Box, Image } from '@chakra-ui/react';
import React from 'react';

import logoSmall from '../../assets/images/simonyi_white_small.svg';
import logo from '../../assets/images/simonyi_white_white.svg';

export default function Footer(): JSX.Element {
  return (
    <Box p={1} backgroundColor="simonyi">
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
    </Box>
  );
}
