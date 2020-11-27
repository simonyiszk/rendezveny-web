import { Box, BoxProps, Flex } from '@chakra-ui/core';
import React from 'react';

import { Log } from '../interfaces';

interface Props extends BoxProps {
  log: Log;
}

export default function LogBox({ log }: Props): JSX.Element {
  return (
    <Flex my="0.25rem" flexDir="column">
      <Flex>
        <Box fontWeight="bold">
          {new Date(log.at).toLocaleDateString()}{' '}
          {new Date(log.at).toLocaleTimeString()}
        </Box>
        <Box>{log.type}</Box>
      </Flex>
      <Flex>
        <Box>{log.query}</Box>
        <Box>{log.result}</Box>
      </Flex>
    </Flex>
  );
}
