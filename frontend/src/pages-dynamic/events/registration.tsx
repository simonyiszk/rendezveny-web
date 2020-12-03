import { useApolloClient } from '@apollo/client';
import { Box, Flex, Grid, Input, useToast } from '@chakra-ui/core';
import { RouteComponentProps } from '@reach/router';
import { navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import { Checkbox, CheckboxGroup } from '../../components/CheckboxGroup';
import { Layout } from '../../components/Layout';
import Loading from '../../components/Loading';
import { Radio, RadioGroup } from '../../components/RadioGroup';
import {
  EventRegistrationFormAnswersInput,
  EventRegistrationFormMultipleChoiceAnswer,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormTextAnswer,
} from '../../interfaces';
import { useEventGetCurrentQuery } from '../../utils/api/registration/EventGetCurrentQuery';
import { useEventGetRegistrationQuery } from '../../utils/api/registration/EventGetRegistrationQuery';
import {
  useModifyFilledInForm,
  useRegisterDeleteMutation,
  useRegisterSelfMutation,
} from '../../utils/api/registration/RegistrationMutation';
import { useEventTokenMutation } from '../../utils/api/token/EventsGetTokenMutation';

interface Props extends RouteComponentProps {
  uniqueName: string;
}

interface AnswerState {
  [key: string]: string | string[];
}

export default function RegistrationPage({ uniqueName }: Props): JSX.Element {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [registered, setRegistered] = useState('');
  const [questionCounter, setQuestionCounter] = useState(0);

  const [
    getCurrent,
    {
      loading: getCurrentLoading,
      called: getCurrentCalled,
      error: getCurrentError,
    },
  ] = useEventGetCurrentQuery((queryData) => {
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
              [curr.id]: (curr.answer as EventRegistrationFormTextAnswer).text,
            };
          }
          return acc;
        },
        {},
      );
      setAnswers(res);
      setRegistered(queryData.events_getOne.selfRelation.registration.id);
    } else {
      setAnswers({});
      setRegistered('');
    }
  });

  const [
    getEvent,
    {
      called: getEventCalled,
      loading: getEventLoading,
      error: getEventError,
      data: getEventData,
    },
  ] = useEventGetRegistrationQuery((queryData) => {
    setQuestionCounter(
      queryData.events_getOne.registrationForm.questions.length,
    );
    getCurrent({
      variables: { id: eventTokenMutationData.events_getToken.id },
    });
  });

  const client = useApolloClient();
  const [
    getEventTokenMutation,
    { error: eventTokenMutationError, data: eventTokenMutationData },
  ] = useEventTokenMutation(client, (data) => {
    getEvent({ variables: { id: data.events_getToken.id } });
  });

  const toast = useToast();
  const makeToast = (
    title: string,
    isError = false,
    description = '',
  ): void => {
    toast({
      title,
      description,
      status: isError ? 'error' : 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  const [getRegisterSelfMutation] = useRegisterSelfMutation({
    onCompleted: () => {
      makeToast('Sikeres regisztráció');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {
      getCurrent({
        variables: { id: eventTokenMutationData.events_getToken.id },
      });
    },
  });
  const [getModifyFilledInForm] = useModifyFilledInForm({
    onCompleted: () => {
      makeToast('Sikeres módosítás');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {
      getCurrent({
        variables: { id: eventTokenMutationData.events_getToken.id },
      });
    },
  });
  const [getRegisterDeleteMutation] = useRegisterDeleteMutation({
    onCompleted: () => {
      makeToast('Sikeres leiratkozás');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {
      getCurrent({
        variables: { id: eventTokenMutationData.events_getToken.id },
      });
    },
  });

  useEffect(() => {
    if (uniqueName) getEventTokenMutation(uniqueName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName]);

  if (
    (getEventCalled && getEventLoading) ||
    (getCurrentCalled && getCurrentLoading)
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationError ||
    getEventError ||
    getCurrentError
  ) {
    console.log(
      !uniqueName,
      eventTokenMutationError,
      getEventError,
      getCurrentError,
    );
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <Box>Error</Box>;
  }

  const getAnswer = (id: string): string | string[] => {
    return answers[id];
  };
  const setAnswer = (id: string, text: string | string[]): void => {
    setAnswers({ ...answers, [id]: text });
  };

  const generateAnswerDTO = (): EventRegistrationFormAnswersInput => {
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

  const handleRegistration = (): void => {
    getRegisterSelfMutation(
      eventTokenMutationData.events_getToken.id,
      generateAnswerDTO(),
    );
  };
  const handleModify = (): void => {
    getModifyFilledInForm(registered, generateAnswerDTO());
  };
  const handleDelete = (): void => {
    getRegisterDeleteMutation(registered);
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" minWidth="50%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            {getEventData &&
              getEventData.events_getOne.registrationForm.questions.map((q) => (
                <React.Fragment key={q.id}>
                  <Box>{q.question}</Box>
                  {q.metadata.type === 'text' && (
                    <Input
                      mb={['1rem', null, '0']}
                      value={getAnswer(q.id) || ''}
                      onChange={(e: React.FormEvent): void => {
                        setAnswer(q.id, (e.target as HTMLInputElement).value);
                      }}
                    />
                  )}
                  {q.metadata.type === 'multiple_choice' &&
                    (q.metadata as EventRegistrationFormMultipleChoiceQuestion)
                      .multipleAnswers && (
                      <CheckboxGroup
                        flexDir="column"
                        value={getAnswer(q.id) || []}
                        onChangeCb={(e: string[]): void => {
                          setAnswer(q.id, e);
                        }}
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
                        onChangeCb={(e: string): void => {
                          setAnswer(q.id, [e]);
                        }}
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
              justifyContent={
                questionCounter > 0
                  ? ['center', null, 'space-between']
                  : 'center'
              }
              flexDir={['column', null, 'row']}
              mt={4}
            >
              {questionCounter > 0 && (
                <Button
                  width={['100%', null, '45%']}
                  text="Módosítás"
                  mb={[4, null, 0]}
                  onClick={handleModify}
                />
              )}
              <Button
                width={['100%', null, '45%']}
                text="Regisztráció törlése"
                backgroundColor="red.500"
                onClick={handleDelete}
              />
            </Flex>
          )}
        </Box>
      </Flex>
    </Layout>
  );
}
