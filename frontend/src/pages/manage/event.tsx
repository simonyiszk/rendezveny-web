import { useApolloClient } from '@apollo/client';
import { Flex, Heading } from '@chakra-ui/core';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import { Event } from '../../interfaces';
import { useEventTokenMutation } from '../../utils/api/token/EventsGetTokenMutation';
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
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

export default function EventPage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

  const [accessOrg, setAccessOrg] = useState(false);
  const [accessChiefCMAdmin, setAccessChiefCMAdmin] = useState(false);

  const client = useApolloClient();
  const [
    getEventTokenMutation,
    { error: eventTokenMutationError },
  ] = useEventTokenMutation(client, () => {
    setAccessOrg(isOrganizer());
    setAccessChiefCMAdmin(isChiefOrganizer() || isClubManager() || isAdmin());
  });

  useEffect(() => {
    if (event) getEventTokenMutation(event.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  if (!event || eventTokenMutationError) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <div>Error</div>;
  }
  return (
    <Layout>
      <Heading textAlign="center" mb="2rem">
        {event?.name} kezelése
      </Heading>
      <Flex flexDir="column" alignItems="center">
        <ProtectedComponent access={accessOrg}>
          <LinkButton
            text="Résztvevők kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to="/manage/members"
            state={{ event }}
          />
        </ProtectedComponent>
        <ProtectedComponent access={accessChiefCMAdmin}>
          <LinkButton
            text="Rendezvény kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to="/manage/details"
            state={{ event }}
          />
        </ProtectedComponent>
        <ProtectedComponent access={accessOrg}>
          <LinkButton
            text="HR tábla"
            width={['100%', null, '30rem']}
            mb="1rem"
            to="/manage/hrtable"
            state={{ event }}
          />
        </ProtectedComponent>
      </Flex>
    </Layout>
  );
}
