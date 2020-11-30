import { Box, BoxProps, Flex } from '@chakra-ui/core';
import { Link } from 'gatsby';
import React from 'react';

import { User } from '../interfaces';
import Button from './Button';

interface Props extends BoxProps {
  user: User;
  event: Event;
  setAttendCb: (user: User) => void;
}

export default function MemberBox({
  user,
  event,
  setAttendCb,
}: Props): JSX.Element {
  const convertDateToText = (d: string): string => {
    const dateTime = new Date(d);

    return `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };
  return (
    <Flex my={4}>
      <Box flexGrow={1} mr={4}>
        <Link
          to="/manage/members/showreg"
          state={{ user, event }}
          style={{ width: '100%' }}
        >
          <Flex
            boxShadow="rgb(210, 210, 210) 1px 1px 2px 2px"
            borderRadius="5px"
            width="100%"
            py={1}
            px={2}
            backgroundColor="white"
            flexDir="column"
            alignItems={['center', null, 'flex-start']}
          >
            <Box fontWeight="bold" fontSize="1.5rem">
              {user.name}
            </Box>
            <Flex flexDir={['column', 'row']}>
              <Box>{convertDateToText(user.registration.registrationDate)}</Box>
            </Flex>
          </Flex>
        </Link>
      </Box>
      <Box flexBasis="4.25rem">
        <Button
          text={user.registration.didAttend ? '✓' : 'X'}
          onClick={() => setAttendCb(user)}
          boxShadow="rgb(210, 210, 210) 1px 1px 2px 2px"
          borderRadius="5px"
          width="100%"
          height="100%"
          py={1}
          px={2}
          backgroundColor={user.registration.didAttend ? 'simonyi' : 'red'}
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          fontSize="2.5rem"
          fontWeight="normal"
        />
      </Box>
    </Flex>
  );
}
