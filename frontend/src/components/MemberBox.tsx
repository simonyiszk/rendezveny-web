import { Box, BoxProps, Flex } from '@chakra-ui/core';
import React from 'react';

import { User } from '../interfaces';
import Button from './Button';
import LinkButton from './LinkButton';

interface Props extends BoxProps {
  user: User;
  setAttendCb: (user: User) => void;
  deleteCb: (user: User) => void;
}

export default function MemberBox({
  user,
  setAttendCb,
  deleteCb,
}: Props): JSX.Element {
  return (
    <Flex my="0.25rem">
      <Box>
        <Box fontWeight="bold">{user.name}</Box>
        <Box>{new Date().toLocaleDateString()}</Box>
      </Box>
      <Flex flexGrow={1} justifyContent="flex-end">
        <LinkButton text="R" to="/manage/member/showreg" state={{ user }} />
        {user.registration.didAttend && (
          <Button text="E" onClick={() => setAttendCb(user)} ml="1rem" />
        )}
        {!user.registration.didAttend && (
          <Button
            text="X"
            onClick={() => setAttendCb(user)}
            ml="1rem"
            backgroundColor="red"
          />
        )}
        <Button
          text="X"
          onClick={() => deleteCb(user)}
          ml="1rem"
          backgroundColor="red"
        />
      </Flex>
    </Flex>
  );
}
