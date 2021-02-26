import { Box, BoxProps, Flex, Grid } from '@chakra-ui/react';
import React from 'react';

import {
  HRCallback,
  HREditCallback,
  HRSegment,
  HRTask,
  User,
} from '../../interfaces';
import HRTaskComp from './HRTaskComp';

interface Props extends BoxProps {
  hrtasks: HRTask[];
  hrcb?: HRCallback;
  hredit?: HREditCallback;
  ownSegmentIds: string[];
  user?: User;
}

export default function HRTableComp({
  hrtasks,
  hrcb,
  hredit,
  ownSegmentIds,
  user,
}: Props): JSX.Element {
  const getAllSegment = (): HRSegment[] => {
    return hrtasks.reduce((acc, curr) => {
      const res = curr.segments.reduce((acc2, curr2) => {
        return [...acc2, curr2];
      }, [] as HRSegment[]);
      return [...acc, ...res];
    }, [] as HRSegment[]);
  };

  const getNumOfSegments = (): number => {
    return getAllSegment().length;
  };
  const getColumns = (): [Date, Date] => {
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
  const generateTimeSequence = (): string[][] => {
    if (getNumOfSegments() === 0) return [];
    const [minStart, maxEnd] = getColumns();
    minStart.setMinutes(Math.floor(minStart.getMinutes() / 15) * 15);
    maxEnd.setMinutes(Math.floor(maxEnd.getMinutes() / 15) * 15);
    const res = [];
    let iter = new Date(minStart.getTime());
    while (iter < maxEnd) {
      const nextIter = new Date(iter.getTime() + 15 * 1000 * 60);
      res.push([
        iter.toISOString(),
        iter.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nextIter.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ]);
      iter = nextIter;
    }
    return res;
  };
  const getNumOfColumns = (): number => {
    if (getNumOfSegments() === 0) return 1;
    const [minStart, maxEnd] = getColumns();
    return Math.ceil(
      (Math.abs(maxEnd.getTime() - minStart.getTime()) / 36e5) * 4,
    );
  };
  const calcPosByTimes = (start: Date, end: Date): [number, number] => {
    const [minStart] = getColumns();
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

  return (
    <Box>
      <Flex flexDir="column" mt={8}>
        <Grid
          templateColumns={`${getNumOfColumns() * 4}rem`}
          rowGap={4}
          overflow="auto"
          p={2}
        >
          <Grid templateColumns={`repeat(${getNumOfColumns()}, 1fr)`}>
            {generateTimeSequence().map((t) => (
              <Box key={t[0]}>
                {t[1]} - {t[2]}
              </Box>
            ))}
          </Grid>
          {hrtasks.map((t, idx) => (
            <HRTaskComp
              key={t.id}
              hrtask={t}
              calc={calcPosByTimes}
              nCols={getNumOfColumns()}
              hrcb={hrcb}
              hredit={{
                hrEdit: hredit?.hrEdit,
                moveUp: idx !== 0 ? hredit?.moveUp : undefined,
                moveDown:
                  idx !== hrtasks.length - 1 ? hredit?.moveDown : undefined,
              }}
              ownSegmentIds={ownSegmentIds}
              user={user}
            />
          ))}
        </Grid>
      </Flex>
    </Box>
  );
}

HRTableComp.defaultProps = {
  hrcb: undefined,
  hredit: undefined,
  user: undefined,
};
