import { Box, BoxProps, Flex } from '@chakra-ui/core';
import React from 'react';

import { HRSegment } from '../interfaces';
import Button from './Button';
import LinkButton from './LinkButton';

interface Props extends BoxProps {
  hrsegment: HRSegment;
  calc: (start: Date, end: Date) => [number, number];
}

export default function HRSegmentComp({ hrsegment, calc }: Props): JSX.Element {
  const [startPos, endPost] = calc(hrsegment.start, hrsegment.end);
  return (
    <Box
      style={{ gridColumn: `${startPos + 2} / ${endPost + 2}` }}
      backgroundColor="simonyi"
    >
      {hrsegment.organizers.length}
    </Box>
  );
}
