import { Box, BoxProps, Flex } from '@chakra-ui/react';
import React from 'react';

import { EventRegistrationFormMultipleChoiceOption } from '../../interfaces';

interface CountedObject {
  [key: string]: number;
}

interface Props extends BoxProps {
  questionData: EventRegistrationFormMultipleChoiceOption[];
  answerOptions: string[][];
}

export default function AggregationMultichoice({
  questionData,
  answerOptions,
}: Props): JSX.Element {
  const aggregationResult = answerOptions.flat().reduce((acc, curr) => {
    acc[curr] = acc[curr] ? acc[curr] + 1 : 1;
    return acc;
  }, {} as CountedObject);

  return (
    <Box>
      {questionData.map((q) => (
        <Flex key={q.id}>
          <Box mr={4}>{q.text}</Box>
          <Box>{aggregationResult[q.id]}</Box>
        </Flex>
      ))}
    </Box>
  );
}
