import { Box, Flex, Grid } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React from 'react';
import { useQuery } from 'urql';

import { registrationGetOneQuery } from '../../../api/registration/EventMembersQuery';
import LinkButton from '../../../components/control/LinkButton';
import QuestionListElement from '../../../components/form/QuestionListElement';
import { Layout } from '../../../components/layout/Layout';
import Loading from '../../../components/util/Loading';
import {
  Event,
  EventRegistrationFormMultipleChoiceAnswer,
  EventRegistrationFormTextAnswer,
  EventRelation,
  RegistrationGetOneResult,
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
  const { event, user } = state as PageState;

  const [
    {
      data: getRegistrationData,
      fetching: getRegistrationFetch,
      error: getRegistrationError,
    },
  ] = useQuery<RegistrationGetOneResult>({
    query: registrationGetOneQuery,
    variables: { id: user.registration.id },
    pause: user === undefined,
  });

  const answers =
    getRegistrationData && getRegistrationData.registration_getOne
      ? getRegistrationData.registration_getOne.formAnswer.answers.reduce(
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
        )
      : {};

  if (getRegistrationFetch) {
    return <Loading />;
  }

  if (!event || !user || getRegistrationError) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <Box>Error</Box>;
  }

  const getAnswer = (id: string): string | string[] => {
    return answers[id];
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" width="80%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            {event?.registrationForm &&
              event.registrationForm.questions.map((q) => (
                <QuestionListElement
                  key={q.id}
                  question={q}
                  getAnswer={getAnswer}
                  isDisabled
                />
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
