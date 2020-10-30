import { Box, BoxProps } from '@chakra-ui/core';
import React from 'react';

import { Event } from '../interfaces';
import SectionHeader from './SectionHeader';

interface Props extends BoxProps {
  text: string;
  listOfEvents: Event[];
}

export default function EventSection({
  text,
  listOfEvents,
}: Props): JSX.Element {
  return (
    <Box>
      {listOfEvents.length > 0 && (
        <div>
          <SectionHeader text={text} />
          {listOfEvents.map((e: Event) => (
            <div key={e.id}>{e.name}</div>
          ))}
        </div>
      )}
    </Box>
  );
}