import { BoxProps, Flex } from '@chakra-ui/core';
import { Link } from 'gatsby';
import React from 'react';

interface Props extends BoxProps {
  to: string;
  state: object;
  text: string;
}

export default function Button({
  to,
  state,
  text,
  ...props
}: Props): JSX.Element {
  return (
    <Flex {...props}>
      <Link to={to} state={state} style={{ width: '100%' }}>
        <Flex
          px="1rem"
          py="0.5rem"
          justifyContent="center"
          alignItems="center"
          backgroundColor="simonyi"
          cursor="pointer"
        >
          {text}
        </Flex>
      </Link>
    </Flex>
  );
}
