import {
  getApolloContext,
  gql,
  useApolloClient,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client';
import { Box, Flex, Grid, Input, Select } from '@chakra-ui/core';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../../../components/Button';
import { Checkbox, CheckboxGroup } from '../../../components/CheckboxGroup';
import EventSection from '../../../components/EventSection';
import { Layout } from '../../../components/Layout';
import LinkButton from '../../../components/LinkButton';
import { Radio, RadioGroup } from '../../../components/RadioGroup';
import {
  Event,
  EventRegistration,
  EventRegistrationForm,
  EventRegistrationFormMultipleChoiceAnswer,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormTextAnswer,
  EventRegistrationFormTextQuestion,
  User,
} from '../../../interfaces';
import { useEventGetCurrentQuery } from '../../../utils/api/registration/EventGetCurrentQuery';
import { useEventGetRegistrationQuery } from '../../../utils/api/registration/EventGetRegistrationQuery';
import {
  registerDeleteMutation,
  useModifyFilledInForm,
  useRegisterDeleteMutation,
  useRegisterSelfMutation,
} from '../../../utils/api/registration/RegistrationMutation';
import { useEventTokenMutation } from '../../../utils/api/token/EventsGetTokenMutation';
import ProtectedComponent from '../../../utils/protection/ProtectedComponent';

interface PageState {
  user: User;
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

interface AnswerState {
  [key: string]: string | string[];
}

export default function EditMemberRegPage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state);
  const { event, user } = state;
  const [getModifyFilledInForm, _getModifyFilledInForm] = useModifyFilledInForm(
    {
      onCompleted: () => {},
      onError: () => {},
      refetchQueries: () => {},
    },
  );
  const [
    getRegisterDeleteMutation,
    _getRegisterDeleteMutation,
  ] = useRegisterDeleteMutation({
    onCompleted: () => {},
    onError: () => {},
    refetchQueries: () => {},
  });

  const getAnswersFromProps = (u: User) => {
    if (u.registration) {
      const res = u.registration.formAnswer.answers.reduce((acc, curr) => {
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
      }, {});
      setAnswers(res);
    }
  };

  useEffect(() => {
    getAnswersFromProps(user);
  }, [user?.id]);

  const [answers, setAnswers] = useState<AnswerState>({});

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

  const handleModify = () => {
    getModifyFilledInForm(user.registration.id, generateAnswerDTO());
  };
  const handleDelete = () => {
    getRegisterDeleteMutation(user.registration.id);
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" minWidth="50%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            {event?.registrationForm &&
              event?.registrationForm.questions.map((q) => (
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
                        onChangeCb={(e: string[]) => setAnswer(q.id, e)}
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
                        onChangeCb={(e: string) => setAnswer(q.id, [e])}
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
              backgroundColor="red.500"
              mt={[4, null, 0]}
              onClick={handleDelete}
            />
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
}
