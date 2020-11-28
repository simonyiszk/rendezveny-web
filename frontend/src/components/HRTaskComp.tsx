import { Box, BoxProps, Flex, Grid } from '@chakra-ui/core';
import React from 'react';

import { HRCallback, HRTask } from '../interfaces';
import Button from './Button';
import HRSegmentComp from './HRSegmentComp';
import LinkButton from './LinkButton';

interface Props extends BoxProps {
  hrtask: HRTask;
  calc: (start: Date, end: Date) => [number, number];
  nCols: number;
  hrcb: HRCallback;
  ownSegmentIds: string[];
}

export default function HRTaskComp({
  hrtask,
  calc,
  nCols,
  hrcb,
  ownSegmentIds,
}: Props): JSX.Element {
  const sortSegments = () => {
    return [...hrtask.segments].sort((a, b) => {
      if (a.isRequired === b.isRequired) {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      }
      if (a.isRequired) return -1;
      return 1;
    });
  };

  return (
    <Grid
      templateColumns={`repeat(${nCols}, 1fr)`}
      mt={4}
      border="1px solid black"
    >
      <Box
        borderRight="solid 1px black"
        style={{
          gridRow: `1 / ${hrtask.segments.length + 1}`,
        }}
      >
        {hrtask.name}
      </Box>
      {sortSegments().map((s, idx) => (
        <HRSegmentComp
          key={s.id}
          hrsegment={s}
          calc={calc}
          row={idx}
          hrcb={hrcb}
          ownSegmentIds={ownSegmentIds}
        />
      ))}
    </Grid>
  );
}
