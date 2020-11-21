import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
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
import React, { useEffect, useState } from 'react';

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
import { useEventTokenMutation } from '../utils/api/EventsGetTokenMutation';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

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
  location: {
    state: { event },
  },
}: Props): JSX.Element {
  console.log('EVENT', event);
  const eventQueryGQL = gql`
    query eventGetOne($id: String!) {
      events_getOne(id: $id) {
        name
        registrationForm {
          questions {
            id
            question
            isRequired
            metadata {
              ... on EventRegistrationFormMultipleChoiceQuestionDTO {
                type
                multipleAnswers
                options {
                  id
                  text
                }
              }
              ... on EventRegistrationFormTextQuestionDTO {
                type
                maxLength
              }
            }
          }
        }
      }
    }
  `;
  interface QueryResult {
    events_getOne: Event;
  }
  const [getEvent, { called, loading, data, error }] = useLazyQuery<
    QueryResult
  >(eventQueryGQL);

  const [getEventTokenMutation, _] = useEventTokenMutation();
  useEffect(() => {
    const fetchEventData = async () => {
      await getEventTokenMutation(event.id);
      getEvent({ variables: { id: event.id } });
    };
    fetchEventData().then(() =>
      console.log('eventdata: ', data, 'error: ', error),
    );
  }, [event.id, data]);

  /* const registrationForm = {
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
  } as EventRegistrationForm; */

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

  if (called && loading) return <div>Loading</div>;

  if (error) {
    return <div>Error {error.message}</div>;
  }
  if (data) console.log('DATA', data.events_getOne.registrationForm.questions);
  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <form onSubmit={handleSubmit}>
          {data &&
            data.events_getOne.registrationForm.questions.map((q) => (
              <Box key={q.id}>
                <Box>{q.question}</Box>
                {q.metadata.type === 'text' && (
                  <Input
                    value={getAnswer(q.id)}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                )}
                {q.metadata.type === 'multiple_choice' && (
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
