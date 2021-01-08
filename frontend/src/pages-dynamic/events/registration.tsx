import { useApolloClient } from '@apollo/client';
import { Box, Flex, Grid, useDisclosure } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { useEventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { useEventGetCurrentQuery } from '../../api/registration/EventGetCurrentQuery';
import { useEventGetRegistrationQuery } from '../../api/registration/EventGetRegistrationQuery';
import {
  useModifyFilledInForm,
  useRegisterDeleteMutation,
  useRegisterSelfMutation,
} from '../../api/registration/RegistrationMutation';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Button from '../../components/control/Button';
import QuestionListElement from '../../components/form/QuestionListElement';
import { Layout } from '../../components/layout/Layout';
import BinaryModal from '../../components/util/BinaryModal';
import Loading from '../../components/util/Loading';
import {
  Event,
  EventRegistrationFormAnswersInput,
  EventRegistrationFormMultipleChoiceAnswer,
  EventRegistrationFormTextAnswer,
} from '../../interfaces';
import useToastService from '../../utils/services/ToastService';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
  uniqueName?: string;
}

interface AnswerState {
  [key: string]: string | string[];
}

export default function RegistrationPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

  const { isOpen, onOpen, onClose } = useDisclosure();

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
  });

  const [
    getCurrentEvent,
    {
      called: getCurrentEventCalled,
      loading: getCurrentEventLoading,
      error: getCurrentEventError,
      data: getCurrentEventData,
    },
  ] = useEventGetInformationQuery((queryData) => {
    getEvent({ variables: { id: queryData.events_getOne.id } });
    getCurrent({
      variables: { id: queryData.events_getOne.id },
    });
  });

  const client = useApolloClient();
  const [
    getEventTokenMutationID,
    { error: eventTokenMutationErrorID },
  ] = useEventTokenMutationID(client, () => {
    getEvent({ variables: { id: event.id } });
    getCurrent({
      variables: { id: event.id },
    });
  });
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
  });

  const makeToast = useToastService();

  const [getRegisterSelfMutation] = useRegisterSelfMutation({
    onCompleted: () => {
      makeToast('Sikeres regisztráció');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {
      getCurrent({
        variables: { id: event?.id ?? getCurrentEventData?.events_getOne.id },
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
        variables: { id: event?.id ?? getCurrentEventData?.events_getOne.id },
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
        variables: { id: event?.id ?? getCurrentEventData?.events_getOne.id },
      });
    },
  });

  useEffect(() => {
    if (event) getEventTokenMutationID(event.id);
    else if (uniqueName) getEventTokenMutationUN(uniqueName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    (getCurrentEventCalled && getCurrentEventLoading) ||
    (getEventCalled && getEventLoading) ||
    (getCurrentCalled && getCurrentLoading)
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationErrorID ||
    eventTokenMutationErrorUN ||
    getCurrentEventError ||
    getEventError ||
    getCurrentError
  ) {
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
      event?.id ?? getCurrentEventData?.events_getOne.id,
      generateAnswerDTO(),
    );
  };
  const handleModify = (): void => {
    getModifyFilledInForm(registered, generateAnswerDTO());
  };
  const handleDelete = (): void => {
    getRegisterDeleteMutation(registered);
    onClose();
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" width="80%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            {getEventData &&
              getEventData.events_getOne.registrationForm.questions.map((q) => (
                <QuestionListElement
                  key={q.id}
                  question={q}
                  getAnswer={getAnswer}
                  setAnswer={setAnswer}
                />
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
                onClick={onOpen}
              />
            </Flex>
          )}
        </Box>
      </Flex>

      <BinaryModal
        isOpen={isOpen}
        onClose={onClose}
        title="Biztosan leiratkozol az eseményről?"
        onAccept={handleDelete}
        onReject={onClose}
      />
    </Layout>
  );
}
RegistrationPage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
