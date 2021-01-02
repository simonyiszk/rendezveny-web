import { Box, BoxProps, Flex, Grid } from '@chakra-ui/react';
import React from 'react';

import {
  HRCallback,
  HREditCallback,
  HRSegment,
  HRTask,
  User,
} from '../interfaces';
import Button from './Button';
import HRSegmentComp from './HRSegmentComp';

interface Props extends BoxProps {
  hrtask: HRTask;
  calc: (start: Date, end: Date) => [number, number];
  nCols: number;
  hrcb?: HRCallback;
  hredit?: HREditCallback;
  ownSegmentIds: string[];
  user: User | undefined;
}

export default function HRTaskComp({
  hrtask,
  calc,
  nCols,
  hrcb,
  hredit,
  ownSegmentIds,
  user,
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
    <Grid templateColumns={`repeat(${nCols}, 1fr)`} rowGap={1}>
      <Flex gridColumn="1 / -1" flexDir="column">
        <Box fontSize="lg" fontWeight="bold" mr={4}>
          {hrtask.name}
        </Box>
        {hredit?.hrEdit && (
          <Flex mb={4}>
            <Button
              width={['2.5rem']}
              px="0.5rem"
              text="E"
              backgroundColor="white"
              cursor="pointer"
              mr={2}
              onClick={(): void => {
                if (hredit.hrEdit) hredit.hrEdit(hrtask);
              }}
            />
            <Button
              width={['2.5rem']}
              px="0.5rem"
              text="U"
              onClick={(): void => {
                if (hredit.moveUp) {
                  hredit.moveUp(hrtask);
                }
              }}
              backgroundColor={!hredit.moveUp ? 'gray.300' : 'white'}
              cursor={!hredit.moveUp ? 'default' : 'pointer'}
              mr={2}
            />
            <Button
              width={['2.5rem']}
              px="0.5rem"
              text="D"
              onClick={(): void => {
                if (hredit.moveDown) {
                  hredit.moveDown(hrtask);
                }
              }}
              backgroundColor={!hredit.moveDown ? 'gray.300' : 'white'}
              cursor={!hredit.moveDown ? 'default' : 'pointer'}
              mr={2}
            />
          </Flex>
        )}
      </Flex>

      {sortSegments().map((s, idx) => (
        <HRSegmentComp
          key={s.id}
          hrsegment={s}
          calc={calc}
          row={idx}
          hrcb={hrcb}
          ownSegmentIds={ownSegmentIds}
          user={user}
        />
      ))}
    </Grid>
  );
}

HRTaskComp.defaultProps = {
  hrcb: undefined,
  hredit: undefined,
};
