import { Box, Flex, Grid, Input } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { useRegistrationGetOneQuery } from '../../../api/registration/EventMembersQuery';
import {
  Checkbox,
  CheckboxGroup,
} from '../../../components/control/CheckboxGroup';
import LinkButton from '../../../components/control/LinkButton';
import { Radio, RadioGroup } from '../../../components/control/RadioGroup';
import { Layout } from '../../../components/layout/Layout';
import Loading from '../../../components/util/Loading';
import {
  Event,
  EventRegistrationFormMultipleChoiceAnswer,
  EventRegistrationFormMultipleChoiceQuestion,
  EventRegistrationFormTextAnswer,
  EventRelation,
} from '../../../interfaces';

interface PageState {
  user: EventRelation;
  event: Event;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
}

interface AnswerState {
  [key: string]: string | string[];
}

export default function ShowMemberRegPage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event, user } = state;

  const [answers, setAnswers] = useState<AnswerState>({});

  const [
    getRegistration,
    {
      loading: getRegistrationLoading,
      called: getRegistrationCalled,
      error: getRegistrationError,
    },
  ] = useRegistrationGetOneQuery((queryData) => {
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
              [curr.id]: (curr.answer as EventRegistrationFormTextAnswer).text,
            };
          }
          return acc;
        },
        {},
      );
      setAnswers(res);
    }
  });

  useEffect(() => {
    if (user) getRegistration({ variables: { id: user.registration.id } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  if (getRegistrationCalled && getRegistrationLoading) {
    return <Loading />;
  }

  if (!event || !user || getRegistrationError) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <Box>Error</Box>;
  }

  const getAnswer = (id: string): string | string[] => {
    return answers[id];
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
              event.registrationForm.questions.map((q) => (
                <React.Fragment key={q.id}>
                  <Box>{q.question}</Box>
                  {q.metadata.type === 'text' && (
                    <Input
                      isDisabled
                      mb={['1rem', null, '0']}
                      value={getAnswer(q.id) || ''}
                    />
                  )}
                  {q.metadata.type === 'multiple_choice' &&
                    (q.metadata as EventRegistrationFormMultipleChoiceQuestion)
                      .multipleAnswers && (
                      <CheckboxGroup
                        isDisabled
                        flexDir="column"
                        value={getAnswer(q.id) || []}
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
                        isDisabled
                        flexDir="column"
                        value={getAnswer(q.id) ? getAnswer(q.id)[0] : ''}
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
          <Flex justifyContent="center" mt={4}>
            <LinkButton
              width={['100%', null, '45%']}
              text="Szerkesztés"
              to={`/manage/${event?.uniqueName}/members/editreg`}
              state={{
                event,
                user,
                answers,
              }}
            />
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
}
ShowMemberRegPage.defaultProps = {
  location: undefined,
};
