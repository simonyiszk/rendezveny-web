import { BoxProps, Flex } from '@chakra-ui/react';
import { Link } from 'gatsby';
import React from 'react';

interface Props extends BoxProps {
  to: string;
  state?: object;
  text: string;
}

export default function LinkButton({
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
          boxShadow="rgb(210, 210, 210) 1px 1px 2px 2px"
          borderRadius="5px"
          fontWeight="bold"
        >
          {text}
        </Flex>
      </Link>
    </Flex>
  );
}
LinkButton.defaultProps = {
  state: {},
};
