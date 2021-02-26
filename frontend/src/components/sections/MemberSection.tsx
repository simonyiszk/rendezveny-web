import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

import { Event, EventRelation } from '../../interfaces';
import MemberBox from './MemberBox';
import SectionHeader from './SectionHeader';

interface Props extends BoxProps {
  text: string;
  listOfMembers: EventRelation[];
  eventL: Event;
  setAttendCb: (user: EventRelation) => void;
}

export default function MemberSection({
  text,
  listOfMembers,
  eventL,
  setAttendCb,
}: Props): JSX.Element {
  return (
    <Box>
      {listOfMembers.length > 0 && (
        <Box>
          <SectionHeader text={text} />
          {listOfMembers.map((e: EventRelation) => (
            <MemberBox
              key={e.userId}
              user={e}
              eventL={eventL}
              setAttendCb={setAttendCb}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
