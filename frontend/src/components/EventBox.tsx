import { Box, BoxProps, Flex } from '@chakra-ui/core';
import React from 'react';

import { Event } from '../interfaces';
import Button from './Button';

interface Props extends BoxProps {
  event: Event;
}

export default function EventBox({ event }: Props): JSX.Element {
  return (
    <Flex my="0.25rem">
      <Box>
        <Box fontWeight="bold">{event.name}</Box>
        <Box>{event.startDate}</Box>
      </Box>
      <Flex flexGrow={1} justifyContent="flex-end">
        <Button text="R" onClick={(e: any) => console.log('R')} />
        <Button text="E" onClick={(e: any) => console.log('E')} ml="1rem" />
      </Flex>
    </Flex>
  );
}
