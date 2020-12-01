import { useApolloClient } from '@apollo/client';
import { Flex, Heading } from '@chakra-ui/core';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect } from 'react';

import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import { Event } from '../../interfaces';
import { useEventTokenMutation } from '../../utils/api/token/EventsGetTokenMutation';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';

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
  const client = useApolloClient();
  const [
    getEventTokenMutation,
    { error: eventTokenMutationError },
  ] = useEventTokenMutation(client);

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
        <ProtectedComponent access={['organizer']}>
          <LinkButton
            text="Résztvevők kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to="/manage/members"
            state={{ event }}
          />
        </ProtectedComponent>
        <ProtectedComponent
          access={['chieforganizer', 'club_manager', 'admin']}
        >
          <LinkButton
            text="Rendezvény kezelése"
            width={['100%', null, '30rem']}
            mb="1rem"
            to="/manage/details"
            state={{ event }}
          />
        </ProtectedComponent>
        <ProtectedComponent access={['organizer']}>
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
