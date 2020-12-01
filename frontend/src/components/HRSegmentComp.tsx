import { Box, BoxProps } from '@chakra-ui/core';
import React from 'react';

import { HRCallback, HRSegment } from '../interfaces';

interface Props extends BoxProps {
  hrsegment: HRSegment;
  calc: (start: Date, end: Date) => [number, number];
  row: number;
  hrcb?: HRCallback;
  ownSegmentIds: string[];
}

export default function HRSegmentComp({
  hrsegment,
  calc,
  row,
  hrcb,
  ownSegmentIds,
}: Props): JSX.Element {
  const [startPos, endPost] = calc(hrsegment.start, hrsegment.end);
  const getBGColor = (): string => {
    if (hrcb && hrsegment.capacity - hrsegment.organizers.length === 0) {
      return 'simonyi';
    }
    if (hrsegment.isRequired) {
      return 'red.500';
    }
    return 'yellow.300';
  };
  const getNameOfOrganizers = (): string => {
    return hrsegment.organizers.map((o) => o.name).join(', ');
  };
  const getText = (): string => {
    if (!hrcb) return '';
    if (hrcb.signUps.includes(hrsegment.id))
      return '✓'.concat(getNameOfOrganizers());
    if (hrcb.signOffs.includes(hrsegment.id))
      return 'X'.concat(getNameOfOrganizers());
    return getNameOfOrganizers();
  };
  const handleClick = (): void => {
    if (!hrcb) return;
    if (ownSegmentIds.includes(hrsegment.id)) hrcb.signOffCb(hrsegment.id);
    else hrcb.signUpCb(hrsegment.id);
  };
  return (
    <Box
      style={{
        gridColumn: `${startPos + 1} / ${endPost + 1}`,
        gridRow: `${row + 1} / ${row + 2}`,
      }}
      backgroundColor={getBGColor()}
      minHeight="1.5rem"
      onClick={handleClick}
    >
      {getText()}
    </Box>
  );
}

HRSegmentComp.defaultProps = {
  hrcb: undefined,
};
