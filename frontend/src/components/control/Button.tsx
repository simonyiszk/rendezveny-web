import { BoxProps, Flex } from '@chakra-ui/react';
import React from 'react';

interface Props extends BoxProps {
  onClick: () => void;
  text: string;
}

export default function Button({
  onClick,
  text,
  ...props
}: Props): JSX.Element {
  return (
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
      onClick={onClick}
      {...props}
    >
      {text}
    </Flex>
  );
}
