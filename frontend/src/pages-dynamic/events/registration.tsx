import { Box, Flex, Grid, useDisclosure } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'urql';

import { eventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { eventGetCurrentQuery } from '../../api/registration/EventGetCurrentQuery';
import { eventGetRegistrationQuery } from '../../api/registration/EventGetRegistrationQuery';
import {
  modifyFilledInForm,
  registerDeleteMutation,
  registerSelfMutation,
} from '../../api/registration/RegistrationMutation';
import {
  eventsGetTokenMutationID,
  eventsGetTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Button from '../../components/control/Button';
import QuestionListElement from '../../components/form/QuestionListElement';
import { Layout } from '../../components/layout/Layout';
import BinaryModal from '../../components/util/BinaryModal';
import Loading from '../../components/util/Loading';
import {
  Event,
  EventGetOneResult,
  EventRegistrationFormAnswersInput,
  EventRegistrationFormMultipleChoiceAnswer,
  EventRegistrationFormTextAnswer,
} from '../../interfaces';
import { RoleContext } from '../../utils/services/RoleContext';
import useToastService from '../../utils/services/ToastService';
import { setEventToken } from '../../utils/token/TokenContainer';

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
  const { event } = state as PageState;

  const roleContext = useContext(RoleContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [loadAnswers, setLoadAnswers] = useState(false);

  const [
    {
      data: eventTokenIDData,
      fetching: eventTokenIDFetch,
      error: eventTokenIDError,
    },
    getEventTokenMutationID,
  ] = useMutation(eventsGetTokenMutationID);
  const [
    {
      data: eventTokenUNData,
      fetching: eventTokenUNFetch,
      error: eventTokenUNError,
    },
    getEventTokenMutationUN,
  ] = useMutation(eventsGetTokenMutationUN);

  const [
    {
      data: getCurrentEventData,
      fetching: getCurrentEventFetch,
      error: getCurrentEventError,
    },
  ] = useQuery<EventGetOneResult>({
    query: eventGetInformationQuery,
    variables: { uniqueName },
    pause: eventTokenUNData === undefined,
  });
  const eventData = event ?? getCurrentEventData?.events_getOne;
  const tokenData = (eventTokenIDData ?? eventTokenUNData)?.events_getToken
    .relation.registration;

  const [
    { data: getEventData, fetching: getEventFetch, error: getEventError },
  ] = useQuery<EventGetOneResult>({
    query: eventGetRegistrationQuery,
    variables: { id: eventData?.id },
    pause: eventData === undefined,
  });

  const [
    { data: getCurrentData, fetching: getCurrentFetch, error: getCurrentError },
    refetchCurrentData,
  ] = useQuery<EventGetOneResult>({
    query: eventGetCurrentQuery,
    variables: { id: eventData?.id },
    pause: eventData === undefined || !loadAnswers,
  });

  const getInitialAnswers = () => {
    if (
      getCurrentData &&
      getCurrentData.events_getOne.selfRelation.registration
    ) {
      const res = getCurrentData.events_getOne.selfRelation.registration.formAnswer.answers.reduce(
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
      return res;
    }
    return {};
  };

  const [answers, setAnswers] = useState<AnswerState>(getInitialAnswers());

  useEffect(() => {
    setAnswers(getInitialAnswers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCurrentData]);

  const makeToast = useToastService();

  const [, getRegisterSelfMutation] = useMutation(registerSelfMutation);
  const [, getModifyFilledInForm] = useMutation(modifyFilledInForm);
  const [, getRegisterDeleteMutation] = useMutation(registerDeleteMutation);

  useEffect(() => {
    if (event)
      getEventTokenMutationID({ id: event.id }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
          if (res.data.events_getToken.relation.registration) {
            setLoadAnswers(true);
          }
        }
      });
    else if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
          if (res.data.events_getToken.relation.registration) {
            setLoadAnswers(true);
          }
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    eventTokenIDFetch ||
    eventTokenUNFetch ||
    getCurrentEventFetch ||
    (!event && !getCurrentEventData) ||
    getEventFetch ||
    getCurrentFetch
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenIDError ||
    eventTokenUNError ||
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

  const registered = tokenData ? tokenData.id : '';
  const questionCounter = getEventData
    ? getEventData.events_getOne.registrationForm.questions.length
    : 0;

  const successfulOperationCallback = () => {
    if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
          if (res.data.events_getToken.relation.registration) {
            setLoadAnswers(true);
            refetchCurrentData({
              query: eventGetCurrentQuery,
              variables: { id: eventData?.id },
            });
          }
          setLoadAnswers(false);
        }
      });
  };
  const handleRegistration = (): void => {
    getRegisterSelfMutation({
      eventId: event?.id ?? getCurrentEventData?.events_getOne.id,
      filledInForm: generateAnswerDTO(),
    }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast('Sikeres regisztráció');
        successfulOperationCallback();
      }
    });
  };
  const handleModify = (): void => {
    if (registered)
      getModifyFilledInForm({
        id: registered,
        filledInForm: generateAnswerDTO(),
      }).then((res) => {
        if (res.error) {
          makeToast('Hiba', true, res.error.message);
        } else {
          makeToast('Sikeres módosítás');
          successfulOperationCallback();
        }
      });
  };
  const handleDelete = (): void => {
    if (registered)
      getRegisterDeleteMutation({ id: registered }).then((res) => {
        if (res.error) {
          makeToast('Hiba', true, res.error.message);
        } else {
          makeToast('Sikeres leiratkozás');
          successfulOperationCallback();
        }
      });
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
              <Button
                width={['100%', null, '45%']}
                order={[1, null, 0]}
                text="Regisztráció törlése"
                backgroundColor="red.500"
                onClick={onOpen}
              />
              {questionCounter > 0 && (
                <Button
                  width={['100%', null, '45%']}
                  text="Módosítás"
                  mb={[4, null, 0]}
                  onClick={handleModify}
                />
              )}
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
