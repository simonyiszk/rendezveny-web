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

import Button from '../../../components/Button';
import EventSection from '../../../components/EventSection';
import { Layout } from '../../../components/Layout';
import LinkButton from '../../../components/LinkButton';
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
import { useEventGetCurrentQuery } from '../../../utils/api/EventGetCurrentQuery';
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

export default function EditMemberRegPage({
  location: {
    state: { user, event },
  },
}: Props): JSX.Element {
  const [
    getModifyFilledInForm,
    _getModifyFilledInForm,
  ] = useModifyFilledInForm();
  const [
    getRegisterDeleteMutation,
    _getRegisterDeleteMutation,
  ] = useRegisterDeleteMutation();

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
  }, [user.id]);

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
        <form>
          {event?.registrationForm &&
            event?.registrationForm.questions.map((q) => (
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
          <>
            <Button text="Módosítás" onClick={handleModify} />
            <Button text="Regisztráció törlése" onClick={handleDelete} />
          </>
        </form>
      </Flex>
    </Layout>
  );
}
