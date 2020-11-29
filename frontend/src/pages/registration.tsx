import {
  getApolloContext,
  gql,
  useApolloClient,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client';
import { Box, Flex, Grid, Input, Select } from '@chakra-ui/core';
import hu from 'date-fns/locale/hu';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../components/Button';
import { Checkbox, CheckboxGroup } from '../components/CheckBoxGroup';
import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import { Radio, RadioGroup } from '../components/RadioGroup';
import {
  Event,
  EventRegistrationForm,
  EventRegistrationFormMultipleChoiceAnswer,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormTextAnswer,
  EventRegistrationFormTextQuestion,
  User,
} from '../interfaces';
import { useEventGetCurrentQuery } from '../utils/api/registration/EventGetCurrentQuery';
import { useEventGetRegistrationQuery } from '../utils/api/registration/EventGetRegistrationQuery';
import {
  useModifyFilledInForm,
  useRegisterDeleteMutation,
  useRegisterSelfMutation,
} from '../utils/api/registration/RegistrationMutation';
import { useEventTokenMutation } from '../utils/api/token/EventsGetTokenMutation';
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
    console.log('setanswer');
    console.log(text);
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
        <Box as="form" minWidth="50%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            {data &&
              data.events_getCurrent.registrationForm.questions.map((q) => (
                <React.Fragment key={q.id}>
                  <Box>{q.question}</Box>
                  {q.metadata.type === 'text' && (
                    <Input
                      mb={['1rem', null, '0']}
                      value={getAnswer(q.id) || ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                    />
                  )}
                  {q.metadata.type === 'multiple_choice' &&
                    (q.metadata as EventRegistrationFormMultipleChoiceQuestion)
                      .multipleAnswers && (
                      <CheckboxGroup
                        flexDir="column"
                        value={getAnswer(q.id) || []}
                        onChangeCb={(e: string[]): void => setAnswer(q.id, e)}
                      >
                        {(q.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                          (option) => (
                            <Checkbox key={option.id} value={option.id} mb={2}>
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
                        flexDir="column"
                        value={getAnswer(q.id) ? getAnswer(q.id)[0] : ''}
                        onChangeCb={(e: string): void => setAnswer(q.id, [e])}
                      >
                        {(q.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                          (option) => (
                            <Radio key={option.id} value={option.id} mb={2}>
                              {option.text}
                            </Radio>
                          ),
                        )}
                      </RadioGroup>
                    )}
                </React.Fragment>
              ))}
          </Grid>
          {!registered && (
            <Flex justifyContent="center" mt={4}>
              <Button
                width={['100%', null, '45%']}
                text="Regisztráció"
                onClick={handleRegistration}
              />
            </Flex>
          )}
          {registered && (
            <Flex
              justifyContent={['center', null, 'space-between']}
              flexDir={['column', null, 'row']}
              mt={4}
            >
              <Button
                width={['100%', null, '45%']}
                text="Módosítás"
                onClick={handleModify}
              />
              <Button
                width={['100%', null, '45%']}
                text="Regisztráció törlése"
                backgroundColor="red"
                mt={[4, null, 0]}
                onClick={handleDelete}
              />
            </Flex>
          )}
        </Box>
      </Flex>
    </Layout>
  );
}
