import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

import {
  EventRegistrationFormMultipleChoiceAnswer,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormQuestion,
  EventRegistrationFormTextAnswer,
  FormQuestionAnswer,
} from '../../interfaces';
import AggregationMultichoice from '../form/AggregationMultichoice';
import AggregationText from '../form/AggregationText';

interface Props extends BoxProps {
  questions: EventRegistrationFormQuestion[];
  answers: FormQuestionAnswer[];
}

export default function FormAggregation({
  questions,
  answers,
}: Props): JSX.Element {
  const getAnswersForQuestion = (questionId: string): FormQuestionAnswer[] => {
    return answers.filter((a) => a.formQuestionId === questionId);
  };

  return (
    <Box>
      {questions.map((q) => (
        <Box
          key={q.id}
          boxShadow="rgb(210 210 210) 1px 1px 2px 2px"
          mb={4}
          p={2}
        >
          <Box fontWeight="bold" mb={2}>
            {q.question}
          </Box>
          <Box>
            {q.metadata.type === 'text' && (
              <AggregationText
                answerTexts={getAnswersForQuestion(q.id).map(
                  (a) => (a.answer as EventRegistrationFormTextAnswer).text,
                )}
              />
            )}
            {q.metadata.type === 'multiple_choice' && (
              <AggregationMultichoice
                questionData={
                  (q.metadata as EventRegistrationFormMultipleChoiceQuestion)
                    .options
                }
                answerOptions={getAnswersForQuestion(q.id).map(
                  (a) =>
                    (a.answer as EventRegistrationFormMultipleChoiceAnswer)
                      .options,
                )}
              />
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
