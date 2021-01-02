import { Box, BoxProps, Flex, Grid } from '@chakra-ui/react';
import React from 'react';

import { Log } from '../interfaces';

interface Props extends BoxProps {
  log: Log;
}

export default function LogBox({ log }: Props): JSX.Element {
  return (
    <Flex mb="1rem" justifyContent="center">
      <Grid
        width={['80%', null, null, '100%']}
        gridTemplateColumns={['1fr', null, null, '1fr 1fr']}
        columnGap={['0', null, '1rem']}
      >
        <Box fontWeight="bold">
          {new Date(log.at).toLocaleDateString()}{' '}
          {new Date(log.at).toLocaleTimeString()}
        </Box>
        <Flex>
          <Box fontWeight="bold" mr={1}>
            {log.type}
          </Box>
          <Box>({log.issuerId})</Box>
        </Flex>
        <Flex>
          <Box fontWeight="bold" mr={1}>
            Query:
          </Box>
          <Box>{log.query}</Box>
        </Flex>
        <Flex>
          <Box fontWeight="bold" mr={1}>
            Result:
          </Box>
          <Box>{log.result}</Box>
        </Flex>
      </Grid>
    </Flex>
  );
}
