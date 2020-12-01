import { Box, BoxProps } from '@chakra-ui/core';
import React from 'react';

import { User } from '../interfaces';
import MemberBox from './MemberBox';
import SectionHeader from './SectionHeader';

interface Props extends BoxProps {
  text: string;
  listOfMembers: User[];
  event: Event;
  setAttendCb: (user: User) => void;
}

export default function MemberSection({
  text,
  listOfMembers,
  event,
  setAttendCb,
}: Props): JSX.Element {
  return (
    <Box>
      {listOfMembers.length > 0 && (
        <Box>
          <SectionHeader text={text} />
          {listOfMembers.map((e: User) => (
            <MemberBox
              key={e.id}
              user={e}
              event={event}
              setAttendCb={setAttendCb}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}