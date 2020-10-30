import { Box, BoxProps } from '@chakra-ui/core';
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
    <Box
      px="1rem"
      py="0.5rem"
      textAlign="center"
      backgroundColor="simonyi"
      cursor="pointer"
      onClick={onClick}
      {...props}
    >
      {text}
    </Box>
  );
}
