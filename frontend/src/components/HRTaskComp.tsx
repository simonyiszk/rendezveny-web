import { Box, BoxProps, Flex } from '@chakra-ui/core';
import React from 'react';

import { HRTask } from '../interfaces';
import Button from './Button';
import HRSegmentComp from './HRSegmentComp';
import LinkButton from './LinkButton';

interface Props extends BoxProps {
  hrtask: HRTask;
  calc: (start: Date, end: Date) => [number, number];
}

export default function HRTaskComp({ hrtask, calc }: Props): JSX.Element {
  return (
    <>
      <Box style={{ gridColumn: `1 / 2` }}>{hrtask.name}</Box>
      {hrtask.segments.map((s) => (
        <HRSegmentComp key={s.id} hrsegment={s} calc={calc} />
      ))}
    </>
  );
}
