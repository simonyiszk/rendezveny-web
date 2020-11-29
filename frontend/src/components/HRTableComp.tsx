import { Box, BoxProps, Flex, Grid } from '@chakra-ui/core';
import React from 'react';

import { HRCallback, HRSegment, HRTable } from '../interfaces';
import Button from './Button';
import HRTaskComp from './HRTaskComp';
import LinkButton from './LinkButton';

interface Props extends BoxProps {
  hrtable: HRTable;
  hrcb: HRCallback;
  ownSegmentIds: string[];
}

export default function HRTableComp({
  hrtable,
  hrcb,
  ownSegmentIds,
}: Props): JSX.Element {
  const getAllSegment = () => {
    return hrtable.tasks.reduce((acc, curr) => {
      const res = curr.segments.reduce((acc2, curr2) => {
        return [...acc2, curr2];
      }, [] as HRSegment[]);
      return [...acc, ...res];
    }, [] as HRSegment[]);
  };

  const getNumOfRows = () => {
    return getAllSegment().length;
  };
  const getColumns = () => {
    const allSegment = getAllSegment();

    const minStart = allSegment.reduce(
      (min, s) => (new Date(s.start) < min ? new Date(s.start) : min),
      new Date(allSegment[0].start),
    );
    const maxEnd = allSegment.reduce(
      (max, s) => (new Date(s.end) > max ? new Date(s.end) : max),
      new Date(allSegment[0].end),
    );
    return [minStart, maxEnd];
  };
  const generateTimeSequence = () => {
    const [minStart, maxEnd] = getColumns();
    minStart.setMinutes(Math.floor(minStart.getMinutes() / 15) * 15);
    maxEnd.setMinutes(Math.floor(maxEnd.getMinutes() / 15) * 15);
    const res = [];
    let iter = new Date(minStart.getTime());
    while (iter < maxEnd) {
      const nextIter = new Date(iter.getTime() + 15 * 1000 * 60);
      res.push([
        iter.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nextIter.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ]);
      iter = nextIter;
    }
    return res;
  };
  const getNumOfColumns = () => {
    const [minStart, maxEnd] = getColumns();
    return Math.ceil(
      (Math.abs(maxEnd.getTime() - minStart.getTime()) / 36e5) * 4 + 1,
    );
  };
  const calcPosByTimes = (start: Date, end: Date): [number, number] => {
    const [minStart, maxEnd] = getColumns();
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setMinutes(Math.floor(startDate.getMinutes() / 15) * 15);
    endDate.setMinutes(Math.floor(endDate.getMinutes() / 15) * 15);
    return [
      Math.ceil(
        (Math.abs(startDate.getTime() - minStart.getTime()) / 36e5) * 4,
      ),
      Math.ceil((Math.abs(endDate.getTime() - minStart.getTime()) / 36e5) * 4),
    ];
  };

  console.log(getNumOfColumns(), getNumOfRows());
  return (
    <Box>
      <Box>HR Tábla</Box>
      <Flex flexDir="column" mt={8}>
        <Grid templateColumns={`repeat(${getNumOfColumns()}, 1fr)`}>
          <Box>Pozíció</Box>
          {generateTimeSequence().map((t, idx) => (
            <Box key={t[0]}>
              {t[0]} - {t[1]}
            </Box>
          ))}
        </Grid>
        {hrtable.tasks.map((t) => (
          <HRTaskComp
            key={t.id}
            hrtask={t}
            calc={calcPosByTimes}
            nCols={getNumOfColumns()}
            hrcb={hrcb}
            ownSegmentIds={ownSegmentIds}
          />
        ))}
      </Flex>
    </Box>
  );
}
