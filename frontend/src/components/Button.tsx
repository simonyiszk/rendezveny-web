import { BoxProps, Flex } from '@chakra-ui/core';
import { Link } from 'gatsby';
import React from 'react';

interface Props extends BoxProps {
  onClick?: () => void;
  to?: string;
  text: string;
}

const wrapComponent = (
  children: JSX.Element,
  to: string | undefined,
): JSX.Element => {
  if (to) {
    return (
      <Flex>
        <Link to={to}>{children}</Link>
      </Flex>
    );
  }
  return <>{children}</>;
};

export default function Button({
  onClick,
  to,
  text,
  ...props
}: Props): JSX.Element {
  return wrapComponent(
    <Flex
      px="1rem"
      py="0.5rem"
      justifyContent="center"
      alignItems="center"
      backgroundColor="simonyi"
      cursor="pointer"
      onClick={onClick}
      {...props}
    >
      {text}
    </Flex>,
    to,
  );
}
