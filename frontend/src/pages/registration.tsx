import {
  getApolloContext,
  gql,
  useApolloClient,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client';
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
  EventRegistrationFormMultipleChoiceAnswer,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormTextAnswer,
  EventRegistrationFormTextQuestion,
  User,
} from '../interfaces';
import { useEventGetOneQuery } from '../utils/api/EventGetOneQuery';
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

  const [getEvent, { called, loading, data, error }] = useEventGetOneQuery(
    (queryData) => {
      if (queryData.events_getOne.selfRelation.registration) {
        const res = queryData.events_getOne.selfRelation.registration.formAnswer.answers.reduce(
          (acc, curr) => {
            if (curr.answer.type === 'multiple_choice') {
              return {
                ...acc,
                [curr.id]: (curr.answer as EventRegistrationFormMultipleChoiceAnswer)
                  .options,
              };
            }
            if (curr.answer.type === 'text') {
              return {
                ...acc,
                [curr.id]: (curr.answer as EventRegistrationFormTextAnswer)
                  .text,
              };
            }
            return acc;
          },
          {},
        );
        console.log('RES', res);
        setAnswers(res);
      }
    },
  );

  const client = useApolloClient();
  const [getEventTokenMutation, _] = useEventTokenMutation(client);
  useEffect(() => {
    const fetchEventData = async () => {
      await getEventTokenMutation(event.id);
      return getEvent({ variables: { id: event.id } });
    };
    fetchEventData().then(() =>
      console.log('eventdata: ', data, 'error: ', error),
    );
  }, [event.id]);

  const [answers, setAnswers] = useState<AnswerState>({});

  const getAnswer = (id: string): string | string[] => {
    return answers[id];
  };
  const setAnswer = (id: string, text: string | string[]): void => {
    setAnswers({ ...answers, [id]: text });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAnswer('2101603f-2228-4b3d-8812-62119ae0670b', ['regular']);
    console.log('Submitted', answers);
  };

  if (called && loading) {
    console.log('Render loading');
    return <div>Loading</div>;
  }

  if (error) {
    console.log('Render error');
    return <div>Error {error.message}</div>;
  }
  if (data) console.log('DATA', data);
  console.log(client);
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
                    value={getAnswer(q.id) || ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                )}
                {q.metadata.type === 'multiple_choice' && (
                  <CheckboxGroup
                    value={getAnswer(q.id) || []}
                    onChange={(e: string[]) => setAnswer(q.id, e)}
                  >
                    {(q.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                      (option) => (
                        <Checkbox key={option.id} value={option.id}>
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
