import { Box, BoxProps } from '@chakra-ui/core';
import React from 'react';

interface Props extends BoxProps {
  text: string;
}

export default function SectionHeader({ text, ...props }: Props): JSX.Element {
  return (
    <Box
      as="h2"
      fontSize={['1rem', null, '2rem']}
      fontWeight={['bold', null, '400']}
      borderBottom="solid 1px black"
      mt="1rem"
      {...props}
    >
      {text}
    </Box>
  );
}
