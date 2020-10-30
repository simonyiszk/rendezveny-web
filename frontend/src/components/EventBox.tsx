import { Box, BoxProps } from '@chakra-ui/core';
import React from 'react';

import { Event } from '../interfaces';

interface Props extends BoxProps {
  event: Event;
}

export default function EventBox({ event }: Props): JSX.Element {
  return (
    <Box my="0.25rem">
      <Box fontWeight="bold">{event.name}</Box>
      <Box>{event.startDate}</Box>
    </Box>
  );
}
