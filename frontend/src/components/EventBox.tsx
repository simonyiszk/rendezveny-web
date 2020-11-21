import { Box, BoxProps, Flex } from '@chakra-ui/core';
import React from 'react';

import { Event } from '../interfaces';
import Button from './Button';
import LinkButton from './LinkButton';

interface Props extends BoxProps {
  event: Event;
  withControls: boolean;
}

export default function EventBox({ event, withControls }: Props): JSX.Element {
  return (
    <Flex my="0.25rem">
      <Box>
        <Box fontWeight="bold">{event.name}</Box>
        <Box>{new Date(event.start).toLocaleDateString()}</Box>
        {event.end && <Box>- {new Date(event.end).toLocaleDateString()}</Box>}
      </Box>
      {withControls && (
        <Flex flexGrow={1} justifyContent="flex-end">
          <LinkButton text="R" to="/registration" state={{ event }} />
          <LinkButton text="E" to="/manage" state={{ event }} ml="1rem" />
        </Flex>
      )}
    </Flex>
  );
}
