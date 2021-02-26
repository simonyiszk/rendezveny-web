import { Box, Input } from '@chakra-ui/react';
import React from 'react';

import {
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormQuestion,
} from '../../interfaces';
import { Checkbox, CheckboxGroup } from '../control/CheckboxGroup';
import { Radio, RadioGroup } from '../control/RadioGroup';

interface Props {
  question: EventRegistrationFormQuestion;
  getAnswer: (id: string) => string | string[];
  setAnswer?: (id: string, text: string | string[]) => void;
  isDisabled?: boolean;
}

export default function QuestionListElement({
  question,
  getAnswer,
  setAnswer,
  isDisabled,
}: Props): JSX.Element {
  return (
    <React.Fragment key={question.id}>
      <Box
        mt={[4, null, 0]}
        fontWeight="bold"
        mb={[2, null, 0]}
        fontSize={['1.25rem', null, '1rem']}
        textAlign={['center', null, 'left']}
      >
        {question.question}
        {question.isRequired && (
          <Box as="span" color="red.500" ml={1}>
            *
          </Box>
        )}
      </Box>
      {question.metadata.type === 'text' && (
        <Input
          isDisabled={isDisabled}
          mb={['1rem', null, '0']}
          value={getAnswer(question.id) || ''}
          onChange={(e: React.FormEvent): void => {
            if (setAnswer)
              setAnswer(question.id, (e.target as HTMLInputElement).value);
          }}
        />
      )}
      {question.metadata.type === 'multiple_choice' &&
        (question.metadata as EventRegistrationFormMultipleChoiceQuestion)
          .multipleAnswers && (
          <CheckboxGroup
            isDisabled={isDisabled}
            flexDir="column"
            value={(getAnswer(question.id) as string[]) || []}
            onChangeCb={(e: string[]): void => {
              if (setAnswer) setAnswer(question.id, e);
            }}
          >
            {(question.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
              (option) => (
                <Checkbox key={option.id} value={option.id} mb={2}>
                  {option.text}
                </Checkbox>
              ),
            )}
          </CheckboxGroup>
        )}
      {question.metadata.type === 'multiple_choice' &&
        !(question.metadata as EventRegistrationFormMultipleChoiceQuestion)
          .multipleAnswers && (
          <RadioGroup
            isDisabled={isDisabled}
            flexDir="column"
            value={getAnswer(question.id) ? getAnswer(question.id)[0] : ''}
            onChangeCb={(e: string): void => {
              if (setAnswer) setAnswer(question.id, [e]);
            }}
          >
            {(question.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
              (option) => (
                <Radio key={option.id} value={option.id} mb={2}>
                  {option.text}
                </Radio>
              ),
            )}
          </RadioGroup>
        )}
    </React.Fragment>
  );
}

QuestionListElement.defaultProps = {
  isDisabled: false,
  setAnswer: undefined,
};
