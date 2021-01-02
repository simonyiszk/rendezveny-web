import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

import { Event } from '../interfaces';
import EventBox from './EventBox';
import SectionHeader from './SectionHeader';

interface Props extends BoxProps {
  listOfEvents: Event[];
  color: string;
  linkTo?: string;
  sectionText?: string;
}

export default function EventSection({
  listOfEvents,
  color,
  linkTo,
  sectionText,
}: Props): JSX.Element {
  return (
    <Box mt={4}>
      {sectionText && <SectionHeader text={sectionText} />}
      {listOfEvents.length > 0 &&
        listOfEvents.map((e: Event) => (
          <EventBox key={e.id} event={e} color={color} linkTo={linkTo} />
        ))}
    </Box>
  );
}

EventSection.defaultProps = {
  linkTo: '',
  sectionText: '',
};
