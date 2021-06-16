import 'react-quill/dist/quill.bubble.css';
import '../../components/reactquillcustom.css';

import { Box, Flex, Heading, useDisclosure } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'urql';

import { eventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { eventGetRegistrationQuery } from '../../api/registration/EventGetRegistrationQuery';
import {
  registerDeleteMutation,
  registerSelfMutation,
} from '../../api/registration/RegistrationMutation';
import {
  eventsGetTokenMutationID,
  eventsGetTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Button from '../../components/control/Button';
import LinkButton from '../../components/control/LinkButton';
import { Layout } from '../../components/layout/Layout';
import BinaryModal from '../../components/util/BinaryModal';
import Loading from '../../components/util/Loading';
import { Event, EventGetOneResult } from '../../interfaces';
import { RoleContext } from '../../utils/services/RoleContext';
import useToastService from '../../utils/services/ToastService';
import { setEventToken } from '../../utils/token/TokenContainer';

const ReactQuill =
  typeof window === 'object' ? require('react-quill') : (): boolean => false;

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
  uniqueName?: string;
}

export default function EventShowPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event } = state as PageState;

  const roleContext = useContext(RoleContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const access =
    roleContext.isOrganizer ||
    roleContext.isAdmin ||
    roleContext.isManagerOfHost;

  const [
    { data: getEventData, fetching: getEventFetch, error: getEventError },
  ] = useQuery<EventGetOneResult>({
    query: eventGetRegistrationQuery,
    variables: { id: eventData?.id },
    pause: eventData === undefined,
  });

  const registered = tokenData ? tokenData.id : '';
  const questionCounter = getEventData
    ? getEventData.events_getOne.registrationForm.questions.length
    : 0;

  const makeToast = useToastService();

  const [, getRegisterSelfMutation] = useMutation(registerSelfMutation);
  const [, getRegisterDeleteMutation] = useMutation(registerDeleteMutation);

  useEffect(() => {
    if (event)
      getEventTokenMutationID({ id: event.id }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
    else if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    getCurrentEventFetch ||
    eventTokenIDFetch ||
    eventTokenUNFetch ||
    getEventFetch ||
    (!event && !getCurrentEventData)
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    getCurrentEventError ||
    eventTokenIDError ||
    eventTokenUNError ||
    getEventError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <Box>Error</Box>;
  }

  const convertDateToText = (d: string): string => {
    const dateTime = new Date(d);

    return `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const hasDescription = (): boolean => {
    const desc = eventData?.description;
    const cleaned = desc.replace(/<\/?[^>]+(>|$)/g, '');
    return cleaned.length > 0;
  };

  const successfulOperationCallback = () => {
    if (event)
      getEventTokenMutationID({ id: event.id }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
    else if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
  };

  const handleRegistration = (): void => {
    getRegisterSelfMutation({
      eventId: event?.id ?? getCurrentEventData?.events_getOne.id,
      filledInForm: {
        answers: [],
      },
    }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast('Sikeres regisztráció');
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

  const getRegistrationButtonComponent = (): JSX.Element => {
    if (questionCounter > 0) {
      if (!registered) {
        return (
          <LinkButton
            text="Regisztráció"
            width={['100%', null, '45%']}
            to={`/events/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }/registration`}
            state={{ event: null }}
          />
        );
      }
      return (
        <LinkButton
          text="Regisztráció szerkesztése"
          width={['100%', null, '45%']}
          to={`/events/${
            event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
          }/registration`}
          state={{ event: null }}
        />
      );
    }
    if (!registered) {
      return (
        <Button
          width={['100%', null, '45%']}
          text="Regisztráció"
          onClick={handleRegistration}
        />
      );
    }
    return (
      <Button
        width={['100%', null, '45%']}
        text="Regisztráció törlése"
        backgroundColor="red.500"
        onClick={onOpen}
      />
    );
  };

  return (
    <Layout>
      <Heading textAlign="center" mb="2rem">
        {eventData?.name}
      </Heading>
      <Flex>
        <Box fontWeight="bold" mr={1}>
          Időpont:
        </Box>
        <Flex flexDir={['column', 'row']}>
          <Box>
            {convertDateToText(eventData?.start)}
            {eventData?.end && ' -'}
          </Box>
          {eventData?.end && (
            <Box ml={1}>{convertDateToText(eventData?.end)}</Box>
          )}
        </Flex>
      </Flex>
      <Flex>
        <Box fontWeight="bold" mr={1}>
          Helyszín:
        </Box>
        <Box>{eventData?.place}</Box>
      </Flex>
      <Flex mt={2}>
        <Box fontWeight="bold" mr={1}>
          Regisztráció:
        </Box>
        <Flex flexDir={['column', 'row']}>
          <Box>
            {convertDateToText(eventData?.registrationStart)}
            {eventData?.registrationEnd && ' -'}
          </Box>
          {eventData?.registrationEnd && (
            <Box ml={1}>{convertDateToText(eventData?.registrationEnd)}</Box>
          )}
        </Flex>
      </Flex>
      <Flex flexDir={['column', 'row']}>
        <Box fontWeight="bold" mr={1}>
          Résztvevők száma:
        </Box>
        <Box mr={1}>{`${eventData?.alreadyRegistered ?? 0}`}</Box>
        {eventData?.capacity > 0 && <Box>{`/ ${eventData?.capacity}`}</Box>}
      </Flex>
      {hasDescription() && (
        <Box
          mt={4}
          className="quill-container-custom"
          px={4}
          py={2}
          boxShadow="rgb(210, 210, 210) 1px 1px 2px 2px"
          borderRadius="5px"
        >
          <ReactQuill
            value={eventData?.description}
            style={{ fontFamily: 'Montserrat' }}
            readOnly
            theme="bubble"
          />
        </Box>
      )}
      <Flex
        justifyContent={access ? ['center', null, 'space-between'] : 'center'}
        flexDir={['column', null, 'row']}
        mt={4}
      >
        {access && (
          <LinkButton
            text="Szerkesztés"
            width={['100%', null, '45%']}
            order={[1, null, 0]}
            to={`/manage/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }`}
            mt={[4, null, 0]}
            state={{ event: null }}
          />
        )}
        {getRegistrationButtonComponent()}
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
EventShowPage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
