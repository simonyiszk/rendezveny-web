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
import { useEventGetRegistrationQuery } from '../../../utils/api/EventGetRegistrationQuery';
import { useRegistrationGetOneQuery } from '../../../utils/api/EventMembersQuery';
import { useEventTokenMutation } from '../../../utils/api/EventsGetTokenMutation';
import {
  useModifyFilledInForm,
  useRegisterDeleteMutation,
  useRegisterSelfMutation,
} from '../../../utils/api/RegistrationMutation';
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

export default function MembersPage({
  location: {
    state: { user, event },
  },
}: Props): JSX.Element {
  const [getRegistration, _getRegistration] = useRegistrationGetOneQuery(
    (queryData) => {
      if (queryData.registration_getOne) {
        const res = queryData.registration_getOne.formAnswer.answers.reduce(
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
        setAnswers(res);
        setCurrentRegistration(queryData.registration_getOne);
      }
    },
  );

  useEffect(() => {
    getRegistration({ variables: { id: user.registration.id } });
  }, [user.id]);

  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentRegistration, setCurrentRegistration] = useState<
    EventRegistration
  >();

  const getAnswer = (id: string): string | string[] => {
    return answers[id];
  };
  const setAnswer = (id: string, text: string | string[]): void => {
    setAnswers({ ...answers, [id]: text });
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <form>
          {event?.registrationForm &&
            event.registrationForm.questions.map((q) => (
              <Box key={q.id}>
                <Box>{q.question}</Box>
                {q.metadata.type === 'text' && (
                  <Input isDisabled value={getAnswer(q.id) || ''} />
                )}
                {q.metadata.type === 'multiple_choice' &&
                  (q.metadata as EventRegistrationFormMultipleChoiceQuestion)
                    .multipleAnswers && (
                    <CheckboxGroup value={getAnswer(q.id) || []}>
                      {(q.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                        (option) => (
                          <Checkbox
                            isDisabled
                            key={option.id}
                            value={option.id}
                          >
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
                    >
                      {(q.metadata as EventRegistrationFormMultipleChoiceQuestion).options.map(
                        (option) => (
                          <Radio isDisabled key={option.id} value={option.id}>
                            {option.text}
                          </Radio>
                        ),
                      )}
                    </RadioGroup>
                  )}
              </Box>
            ))}
          <LinkButton
            text="Szerkesztés"
            to="/manage/members/editreg"
            state={{
              user: { ...user, registration: currentRegistration },
              event,
            }}
          />
        </form>
      </Flex>
    </Layout>
  );
}
