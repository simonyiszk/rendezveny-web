import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

export default function Label({ children, ...props }: BoxProps): JSX.Element {
  return (
    <Box mt={['1rem', null, 0]} {...props}>
      {children}
    </Box>
  );
}
