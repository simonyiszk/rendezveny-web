import 'react-datepicker/dist/react-datepicker.css';

import { gql, useQuery } from '@apollo/client';
import {
  Box,
  Checkbox,
  CheckboxGroup,
  Flex,
  Input,
  Select,
} from '@chakra-ui/core';
import hu from 'date-fns/locale/hu';
import { navigate, PageProps } from 'gatsby';
import { Multiselect } from 'multiselect-react-dropdown';
import React, { useEffect, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import Button from '../components/Button';
import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import {
  Event,
  EventRegistrationForm,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormTextQuestion,
  User,
} from '../interfaces';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

registerLocale('hu', hu);

interface PageState {
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

interface AnswerState {
  [key: string]: string | string[];
}

export default function RegistrationPage({
  location: { state },
}: Props): JSX.Element {
  const registrationForm = {
    questions: [
      {
        id: '123',
        isRequired: false,
        question: 'Becenév',
        metadata: { maxLength: 20, type: 'text' },
      },
      {
        id: '456',
        isRequired: false,
        question: 'Ételérzékenység',
        metadata: {
          multipleAnswers: true,
          options: [
            { id: '0', text: 'Glutén' },
            { id: '1', text: 'Laktoz' },
          ],
          type: 'multiplechoice',
        },
      },
    ],
  } as EventRegistrationForm;

  const [answers, setAnswers] = useState<AnswerState>({});

  const getAnswer = (id: string): string | string[] => {
    return answers[id];
  };
  const setAnswer = (id: string, text: string | string[]): void => {
    setAnswers({ ...answers, [id]: text });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted', answers);
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <form onSubmit={handleSubmit}>
          {registrationForm.questions.map((q) => (
            <Box key={q.id}>
              <Box>{q.question}</Box>
              {q.metadata.type === 'text' && (
                <Input
                  value={getAnswer(q.id)}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}
              {q.metadata.type === 'multiplechoice' && (
                <CheckboxGroup
                  value={getAnswer(q.id)}
                  onChange={(e: string[]) => setAnswer(q.id, e)}
                >
                  {(q.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                    (option) => (
                      <Checkbox key={option.id} value={option.text}>
                        {option.text}
                      </Checkbox>
                    ),
                  )}
                </CheckboxGroup>
              )}
            </Box>
          ))}
          <button type="submit">Submit</button>
        </form>
      </Flex>
    </Layout>
  );
}
