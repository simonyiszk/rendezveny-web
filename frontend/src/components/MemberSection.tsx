import { Box, BoxProps } from '@chakra-ui/core';
import React from 'react';

import { User } from '../interfaces';
import MemberBox from './MemberBox';
import SectionHeader from './SectionHeader';

interface Props extends BoxProps {
  text: string;
  listOfMembers: User[];
  setAttendCb: (user: User) => void;
  deleteCb: (user: User) => void;
}

export default function MemberSection({
  text,
  listOfMembers,
  setAttendCb,
  deleteCb,
}: Props): JSX.Element {
  return (
    <Box>
      {listOfMembers.length > 0 && (
        <div>
          <SectionHeader text={text} />
          <Box pl={['0', null, '0.5rem']}>
            {listOfMembers.map((e: User) => (
              <MemberBox
                key={e.id}
                user={e}
                setAttendCb={setAttendCb}
                deleteCb={deleteCb}
              />
            ))}
          </Box>
        </div>
      )}
    </Box>
  );
}
