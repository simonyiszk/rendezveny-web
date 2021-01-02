import { Box, BoxProps, Flex } from '@chakra-ui/react';
import React from 'react';

import { HRCallback, HRSegment, User } from '../../interfaces';

interface Props extends BoxProps {
  hrsegment: HRSegment;
  calc: (start: Date, end: Date) => [number, number];
  row: number;
  hrcb?: HRCallback;
  ownSegmentIds: string[];
  user: User | undefined;
}

export default function HRSegmentComp({
  hrsegment,
  calc,
  row,
  hrcb,
  ownSegmentIds,
  user,
}: Props): JSX.Element {
  const [startPos, endPost] = calc(hrsegment.start, hrsegment.end);

  const isSegmentFull = (): boolean => {
    return hrsegment.capacity - hrsegment.organizers.length === 0;
  };

  const getBGColor = (): string => {
    if (hrcb && isSegmentFull()) {
      return 'simonyi';
    }
    if (hrsegment.isRequired) {
      return 'red.500';
    }
    return 'yellow.300';
  };
  const getInnerNodes = (): JSX.Element => {
    if (!hrcb) return <Box />;
    if (hrcb.signUps.includes(hrsegment.id))
      return (
        <>
          {hrsegment.organizers.map((o) => {
            return (
              <Box key={o.userId} mr={1}>
                {o.name}
              </Box>
            );
          })}
          <Box fontWeight="bold">{user?.name}</Box>
        </>
      );
    if (hrcb.signOffs.includes(hrsegment.id))
      return (
        <>
          {hrsegment.organizers.map((o) => {
            return (
              <Box
                key={o.userId}
                textDecor={o.userId === user?.id ? 'line-through' : 'normal'}
                mr={1}
              >
                {o.name}
              </Box>
            );
          })}
        </>
      );
    return (
      <>
        {hrsegment.organizers.map((o) => {
          return (
            <Box key={o.userId} mr={1}>
              {o.name}
            </Box>
          );
        })}
      </>
    );
  };
  const handleClick = (): void => {
    if (!hrcb) return;
    if (ownSegmentIds.includes(hrsegment.id)) hrcb.signOffCb(hrsegment.id);
    else if (!isSegmentFull()) hrcb.signUpCb(hrsegment.id);
  };
  return (
    <Flex
      style={{
        gridColumn: `${startPos + 1} / ${endPost + 1}`,
        gridRow: `${row + 2} / ${row + 3}`,
      }}
      backgroundColor={getBGColor()}
      minHeight="1.5rem"
      onClick={handleClick}
    >
      {getInnerNodes()}
    </Flex>
  );
}

HRSegmentComp.defaultProps = {
  hrcb: undefined,
};
