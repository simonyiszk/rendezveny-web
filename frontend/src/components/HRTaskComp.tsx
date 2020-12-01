import { Box, BoxProps, Grid } from '@chakra-ui/core';
import React from 'react';

import { HRCallback, HRSegment, HRTask } from '../interfaces';
import HRSegmentComp from './HRSegmentComp';

interface Props extends BoxProps {
  hrtask: HRTask;
  calc: (start: Date, end: Date) => [number, number];
  nCols: number;
  hrcb?: HRCallback;
  hredit?: (task: HRTask) => void;
  ownSegmentIds: string[];
}

export default function HRTaskComp({
  hrtask,
  calc,
  nCols,
  hrcb,
  hredit,
  ownSegmentIds,
}: Props): JSX.Element {
  const sortSegments = (): HRSegment[] => {
    return [...hrtask.segments].sort((a, b) => {
      if (a.isRequired === b.isRequired) {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      }
      if (a.isRequired) return -1;
      return 1;
    });
  };

  return (
    <>
      <Box>{hrtask.name}</Box>
      <Grid
        templateColumns={`repeat(${nCols}, 1fr)`}
        border="1px solid black"
        onClick={(): void => {
          if (hredit) hredit(hrtask);
        }}
      >
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
    </>
  );
}

HRTaskComp.defaultProps = {
  hrcb: undefined,
  hredit: undefined,
};
