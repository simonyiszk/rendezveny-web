import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { Box, BoxProps, Flex } from '@chakra-ui/react';
import { Link } from 'gatsby';
import React from 'react';

import { Event, EventRelation } from '../../interfaces';
import Button from '../control/Button';

interface Props extends BoxProps {
  user: EventRelation;
  eventL: Event;
  setAttendCb: (user: EventRelation) => void;
}

export default function MemberBox({
  user,
  eventL,
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
          to={`/manage/${eventL.uniqueName}/members/showreg`}
          state={{ user, event: eventL }}
          style={{ width: '100%' }}
        >
          <Flex
            boxShadow="rgb(210, 210, 210) 1px 1px 2px 2px"
            borderRadius="5px"
            width="100%"
            py={1}
            px={2}
            backgroundColor="white"
            flexDir={['column', null, null, 'row']}
            alignItems={['center', null, 'flex-start', 'center']}
          >
            <Box fontWeight="bold" fontSize="1.5rem" flexGrow={1}>
              {user.name}
            </Box>
            <Flex
              flexBasis={[null, null, null, '9rem']}
              flexShrink={0}
              alignSelf={[null, null, 'flex-end', 'center']}
            >
              <Box>{convertDateToText(user.registration.registrationDate)}</Box>
            </Flex>
          </Flex>
        </Link>
      </Box>
      <Box flexShrink={0}>
        <Button
          text={
            user.registration.didAttend ? (
              <CheckIcon boxSize={['1.2em', null, null, '0.6em']} />
            ) : (
              <CloseIcon boxSize={['1em', null, null, '0.5em']} />
            )
          }
          onClick={(): void => {
            setAttendCb(user);
          }}
          boxShadow="rgb(210, 210, 210) 1px 1px 2px 2px"
          borderRadius="5px"
          width={['4.25rem', null, null, '2.75rem']}
          height={['4.25rem', null, null, '2.75rem']}
          py={1}
          px={2}
          backgroundColor={user.registration.didAttend ? 'simonyi' : 'red.500'}
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
