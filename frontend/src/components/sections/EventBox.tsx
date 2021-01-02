import { Box, BoxProps, Flex } from '@chakra-ui/react';
import { Link } from 'gatsby';
import React from 'react';

import { Event } from '../../interfaces';

interface Props extends BoxProps {
  event: Event;
  color: string;
  linkTo?: string;
}

export default function EventBox({ event, color, linkTo }: Props): JSX.Element {
  const convertDateToText = (d: string): string => {
    const dateTime = new Date(d);

    return `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };
  const wrapElement = (element: JSX.Element): JSX.Element => {
    if (!linkTo) return element;
    return (
      <Link
        to={linkTo.replace('{uniqueName}', event.uniqueName)}
        state={{ event }}
        style={{ width: '100%' }}
      >
        {element}
      </Link>
    );
  };
  return (
    <Flex my={4}>
      {wrapElement(
        <Flex
          boxShadow="rgb(210, 210, 210) 1px 1px 2px 2px"
          borderRadius="5px"
          width="100%"
          py={1}
          px={2}
          backgroundColor={color}
          flexDir="column"
          alignItems={['center', null, 'flex-start']}
        >
          <Box fontWeight="bold" fontSize="1.5rem">
            {event.name}
          </Box>
          <Flex flexDir={['column', 'row']}>
            <Box>
              {convertDateToText(event.start)}
              {event.end && ' -'}
            </Box>
            {event.end && <Box ml={1}>{convertDateToText(event.end)}</Box>}
          </Flex>
        </Flex>,
      )}
    </Flex>
  );
}

EventBox.defaultProps = {
  linkTo: '',
};
