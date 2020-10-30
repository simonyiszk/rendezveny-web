import { Box, BoxProps } from '@chakra-ui/core';
import React from 'react';

import { Event } from '../interfaces';
import EventBox from './EventBox';
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
          <Box pl={['0', null, '0.5rem']}>
            {listOfEvents.map((e: Event) => (
              <EventBox key={e.id} event={e} />
            ))}
          </Box>
        </div>
      )}
    </Box>
  );
}
