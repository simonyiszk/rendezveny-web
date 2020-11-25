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
  Radio,
  RadioGroup,
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
import { useEventGetCurrentQuery } from '../utils/api/EventGetCurrentQuery';
import { useEventGetRegistrationQuery } from '../utils/api/EventGetRegistrationQuery';
import { useEventTokenMutation } from '../utils/api/EventsGetTokenMutation';
import {
  useModifyFilledInForm,
  useRegisterDeleteMutation,
  useRegisterSelfMutation,
} from '../utils/api/RegistrationMutation';
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
  const [
    getEvent,
    { called, loading, data, error },
  ] = useEventGetRegistrationQuery((queryData) => {
    getCurrent();
  });

  const client = useApolloClient();
  const [getEventTokenMutation, _getEventTokenMutation] = useEventTokenMutation(
    client,
  );
  const [
    getRegisterSelfMutation,
    _getRegisterSelfMutation,
  ] = useRegisterSelfMutation();
  const [
    getModifyFilledInForm,
    _getModifyFilledInForm,
  ] = useModifyFilledInForm();
  const [
    getRegisterDeleteMutation,
    _getRegisterDeleteMutation,
  ] = useRegisterDeleteMutation();
  const [getCurrent, _getCurrent] = useEventGetCurrentQuery((queryData) => {
    console.log('GetCurrent', queryData);
    if (queryData.events_getCurrent.selfRelation.registration) {
      const res = queryData.events_getCurrent.selfRelation.registration.formAnswer.answers.reduce(
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
              [curr.id]: (curr.answer as EventRegistrationFormTextAnswer).text,
            };
          }
          return acc;
        },
        {},
      );
      setAnswers(res);
      setRegistered(queryData.events_getCurrent.selfRelation.registration.id);
    }
  });

  useEffect(() => {
    const fetchEventData = async () => {
      await getEventTokenMutation(event.id);
      return getEvent();
    };
    fetchEventData();
  }, [event.id]);

  const [answers, setAnswers] = useState<AnswerState>({});
  const [registered, setRegistered] = useState('');

  const getAnswer = (id: string): string | string[] => {
    return answers[id];
  };
  const setAnswer = (id: string, text: string | string[]): void => {
    setAnswers({ ...answers, [id]: text });
  };

  const generateAnswerDTO = () => {
    return {
      answers: Object.entries(answers).map(([key, value]) => {
        return {
          id: key,
          answer: JSON.stringify(
            Array.isArray(value)
              ? {
                  type: 'multiple_choice',
                  options: value,
                }
              : {
                  type: 'text',
                  text: value,
                },
          ),
        };
      }),
    };
  };

  const handleRegistration = () => {
    getRegisterSelfMutation(event.id, generateAnswerDTO());
  };
  const handleModify = () => {
    getModifyFilledInForm(registered, generateAnswerDTO());
  };
  const handleDelete = () => {
    getRegisterDeleteMutation(registered);
  };

  if (called && loading) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>Error {error.message}</div>;
  }

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <form>
          {data &&
            data.events_getCurrent.registrationForm.questions.map((q) => (
              <Box key={q.id}>
                <Box>{q.question}</Box>
                {q.metadata.type === 'text' && (
                  <Input
                    value={getAnswer(q.id) || ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                )}
                {q.metadata.type === 'multiple_choice' &&
                  (q.metadata as EventRegistrationFormMultipleChoiceQuestion)
                    .multipleAnswers && (
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
                {q.metadata.type === 'multiple_choice' &&
                  !(q.metadata as EventRegistrationFormMultipleChoiceQuestion)
                    .multipleAnswers && (
                    <RadioGroup
                      value={getAnswer(q.id) ? getAnswer(q.id)[0] : ''}
                      onChange={(e: string[]) =>
                        setAnswer(q.id, [e.target.value])
                      }
                    >
                      {(q.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                        (option) => (
                          <Radio key={option.id} value={option.id}>
                            {option.text}
                          </Radio>
                        ),
                      )}
                    </RadioGroup>
                  )}
              </Box>
            ))}
          {!registered && (
            <Button text="Regisztráció" onClick={handleRegistration} />
          )}
          {registered && (
            <>
              <Button text="Módosítás" onClick={handleModify} />
              <Button text="Regisztráció törlése" onClick={handleDelete} />
            </>
          )}
        </form>
      </Flex>
    </Layout>
  );
}
