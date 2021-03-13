import { Box, BoxProps, Flex } from '@chakra-ui/react';
import React from 'react';

interface CountedObject {
  [key: string]: number;
}

interface CountedArray {
  text: string;
  count: number;
}

interface Props extends BoxProps {
  answerTexts: string[];
}

export default function AggregationText({ answerTexts }: Props): JSX.Element {
  const computeAggregation = (): CountedArray[] => {
    const countedTexts = answerTexts.reduce((acc, curr) => {
      acc[curr] = acc[curr] ? acc[curr] + 1 : 1;

      return acc;
    }, {} as CountedObject);

    return Object.entries(countedTexts)
      .sort(([, a], [, b]) => a - b)
      .reduce(
        (r, [k, v]) => [...r, { text: k, count: v }],
        [] as CountedArray[],
      );
  };

  return (
    <Box>
      {computeAggregation().map((v) => (
        <Flex key={v.text}>
          <Box mr={4}>{v.text}</Box>
          <Box>{v.count}</Box>
        </Flex>
      ))}
    </Box>
  );
}
