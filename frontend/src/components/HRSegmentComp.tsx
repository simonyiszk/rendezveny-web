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
  const getBGColor = () => {
    if (hrsegment.capacity - hrsegment.organizers.length === 0) {
      return 'simonyi';
    }
    if (hrsegment.isRequired) {
      return 'red';
    }
    return 'yellow';
  };
  const getBorder = () => {
    if (!hrcb) return '';
    if (hrcb.signUps.includes(hrsegment.id)) return 'solid 4px green';
    if (hrcb.signOffs.includes(hrsegment.id)) return 'solid 4px red';
    return '';
  };
  const getText = () => {
    if (!hrcb) return '';
    if (hrcb.signUps.includes(hrsegment.id)) return 'UP';
    if (hrcb.signOffs.includes(hrsegment.id)) return 'DOWN';
    return hrsegment.organizers.map((o) => o.name).join(', ');
  };
  const handleClick = () => {
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
      border={getBorder()}
      minHeight="1.5rem"
      onClick={handleClick}
    >
      {getText()}
    </Box>
  );
}
