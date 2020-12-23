import 'react-quill/dist/quill.bubble.css';
import '../../components/reactquillcustom.css';

import { useApolloClient } from '@apollo/client';
import { Box, Flex, Heading } from '@chakra-ui/core';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect } from 'react';
import ReactQuill from 'react-quill';

import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import Loading from '../../components/Loading';
import { Event } from '../../interfaces';
import { useEventGetInformationQuery } from '../../utils/api/index/EventsGetInformation';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../utils/api/token/EventsGetTokenMutation';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location: PageProps<null, null, PageState>['location'];
  uniqueName: string;
}

export default function EventShowPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

  const [
    getCurrentEvent,
    {
      called: getCurrentEventCalled,
      loading: getCurrentEventLoading,
      error: getCurrentEventError,
      data: getCurrentEventData,
    },
  ] = useEventGetInformationQuery();

  const client = useApolloClient();
  const [
    getEventTokenMutationID,
    { error: eventTokenMutationErrorID },
  ] = useEventTokenMutationID(client);
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
  });

  useEffect(() => {
    if (event) getEventTokenMutationID(event.id);
    else if (uniqueName) getEventTokenMutationUN(uniqueName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    (!event && !getCurrentEventCalled) ||
    (getCurrentEventCalled && getCurrentEventLoading)
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationErrorID ||
    eventTokenMutationErrorUN ||
    getCurrentEventError
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

  return (
    <Layout>
      <Heading textAlign="center" mb="2rem">
        {(event ?? getCurrentEventData?.events_getOne)?.name}
      </Heading>
      <Flex>
        <Box fontWeight="bold" mr={1}>
          Időpont:
        </Box>
        <Flex flexDir={['column', 'row']}>
          <Box>
            {convertDateToText(
              (event ?? getCurrentEventData?.events_getOne)?.start,
            )}
            {(event ?? getCurrentEventData?.events_getOne)?.end && ' -'}
          </Box>
          {(event ?? getCurrentEventData?.events_getOne)?.end && (
            <Box ml={1}>
              {convertDateToText(
                (event ?? getCurrentEventData?.events_getOne)?.end,
              )}
            </Box>
          )}
        </Flex>
      </Flex>
      <Flex>
        <Box fontWeight="bold" mr={1}>
          Helyszín:
        </Box>
        <Box>{(event ?? getCurrentEventData?.events_getOne)?.place}</Box>
      </Flex>
      <Box mt={2} className="quill-container-custom">
        <ReactQuill
          value={(event ?? getCurrentEventData?.events_getOne)?.description}
          style={{ fontFamily: 'Montserrat' }}
          readOnly
          theme="bubble"
        />
      </Box>
      <Flex mt={2}>
        <Box fontWeight="bold" mr={1}>
          Regisztrációs időszak:
        </Box>
        <Flex flexDir={['column', 'row']}>
          <Box>
            {convertDateToText(
              (event ?? getCurrentEventData?.events_getOne)?.registrationStart,
            )}
            {(event ?? getCurrentEventData?.events_getOne)?.registrationEnd &&
              ' -'}
          </Box>
          {(event ?? getCurrentEventData?.events_getOne)?.registrationEnd && (
            <Box ml={1}>
              {convertDateToText(
                (event ?? getCurrentEventData?.events_getOne)?.registrationEnd,
              )}
            </Box>
          )}
        </Flex>
      </Flex>
      <Flex flexDir={['column', 'row']}>
        <Flex mr={1}>
          <Box fontWeight="bold" mr={1}>
            Regisztráltak száma:
          </Box>
          <Box>{(event ?? getCurrentEventData?.events_getOne)?.capacity}</Box>
        </Flex>
        <Flex>
          <Box fontWeight="bold" mr={1}>
            Férőhely:
          </Box>
          <Box>{(event ?? getCurrentEventData?.events_getOne)?.capacity}</Box>
        </Flex>
      </Flex>
      <Flex justifyContent="center" mt={4}>
        <LinkButton
          text="Regisztráció"
          width={['100%', null, '15rem']}
          to={`/events/${
            event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
          }/registration`}
          state={{ event: null }}
        />
      </Flex>
    </Layout>
  );
}
