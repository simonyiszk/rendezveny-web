import 'react-quill/dist/quill.bubble.css';
import '../../components/reactquillcustom.css';

import { Box, Flex, Heading } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect } from 'react';
import { useMutation, useQuery } from 'urql';

import { eventGetInformationQuery } from '../../api/index/EventsGetInformation';
import {
  eventsGetTokenMutationID,
  eventsGetTokenMutationUN,
  setEventTokenAndRole,
} from '../../api/token/EventsGetTokenMutation';
import LinkButton from '../../components/control/LinkButton';
import { Layout } from '../../components/layout/Layout';
import Loading from '../../components/util/Loading';
import { Event, EventGetOneResult } from '../../interfaces';
import {
  isAdmin,
  isClubManagerOf,
  isOrganizer,
} from '../../utils/token/TokenContainer';

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

  const [
    { fetching: eventTokenIDFetch, error: eventTokenIDError },
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

  useEffect(() => {
    if (event)
      getEventTokenMutationID({ id: event.id }).then((res) => {
        if (!res.error) {
          setEventTokenAndRole(res.data);
        }
      });
    else if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          setEventTokenAndRole(res.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    getCurrentEventFetch ||
    eventTokenIDFetch ||
    eventTokenUNFetch ||
    (!event && !getCurrentEventData)
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    getCurrentEventError ||
    eventTokenIDError ||
    eventTokenUNError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <Box>Error</Box>;
  }
  const eventData = event ?? getCurrentEventData?.events_getOne;
  const access =
    isOrganizer() || isAdmin() || eventData
      ? isClubManagerOf(eventData.hostingClubs)
      : false;

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
        <LinkButton
          text="Regisztráció"
          width={['100%', null, '45%']}
          to={`/events/${
            event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
          }/registration`}
          state={{ event: null }}
        />
      </Flex>
    </Layout>
  );
}
EventShowPage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
