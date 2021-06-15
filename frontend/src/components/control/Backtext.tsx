import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/react';
import { Link } from '@reach/router';
import React from 'react';

interface Props {
  text: string;
  to: string;
  state?: any;
}

export default function Backtext({ text, to, state }: Props) {
  return (
    <Box width="100%" fontWeight="bold" mb={4}>
      <Box
        as={Link}
        to={to}
        state={state}
        style={{ width: '100%' }}
        _hover={{ textDecor: 'underline' }}
      >
        <ArrowBackIcon /> {text}
      </Box>
    </Box>
  );
}
Backtext.defaultProps = {
  state: undefined,
};
