import { useApolloClient } from '@apollo/client';
import { Flex, Heading } from '@chakra-ui/core';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import Loading from '../../components/Loading';
import { Event } from '../../interfaces';
import { useEventGetInformationQuery } from '../../utils/api/index/EventsGetInformation';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../utils/api/token/EventsGetTokenMutation';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';
import {
  isAdmin,
  isChiefOrganizer,
  isClubManager,
  isOrganizer,
} from '../../utils/token/TokenContainer';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location: PageProps<null, null, PageState>['location'];
  uniqueName: string;
}

export default function EventPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

  console.log(event, uniqueName);

  const [accessOrg, setAccessOrg] = useState(false);
  const [accessChiefCMAdmin, setAccessChiefCMAdmin] = useState(false);

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
  ] = useEventTokenMutationID(client, () => {
    setAccessOrg(isOrganizer());
    setAccessChiefCMAdmin(isChiefOrganizer() || isClubManager() || isAdmin());
  });
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
    setAccessOrg(isOrganizer());
    setAccessChiefCMAdmin(isChiefOrganizer() || isClubManager() || isAdmin());
  });

  useEffect(() => {
    if (event) getEventTokenMutationID(event.id);
    else if (uniqueName) getEventTokenMutationUN(uniqueName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (getCurrentEventCalled && getCurrentEventLoading) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationErrorID ||
    eventTokenMutationErrorUN ||
    getCurrentEventError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <div>Error</div>;
  }
  return (
    <Layout>
      <Heading textAlign="center" mb="2rem">
        {event?.name ?? getCurrentEventData?.events_getOne.name} kezelése
      </Heading>
      <Flex flexDir="column" alignItems="center">
        <ProtectedComponent access={accessOrg}>
          <LinkButton
            text="Résztvevők kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to={`/manage/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }/members`}
            state={{ event: event ?? getCurrentEventData?.events_getOne }}
          />
        </ProtectedComponent>
        <ProtectedComponent access={accessChiefCMAdmin}>
          <LinkButton
            text="Rendezvény kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to={`/manage/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }/details`}
            state={{ event: event ?? getCurrentEventData?.events_getOne }}
          />
        </ProtectedComponent>
        <ProtectedComponent access={accessOrg}>
          <LinkButton
            text="HR tábla"
            width={['100%', null, '30rem']}
            mb="1rem"
            to={`/manage/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }/hrtable`}
            state={{ event: event ?? getCurrentEventData?.events_getOne }}
          />
        </ProtectedComponent>
      </Flex>
    </Layout>
  );
}
