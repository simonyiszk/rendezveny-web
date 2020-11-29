import { gql, useApolloClient, useQuery } from '@apollo/client';
import { Flex, Heading } from '@chakra-ui/core';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
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

export default function EventPage({
  location: {
    state: { event },
  },
}: Props): JSX.Element {
  const client = useApolloClient();
  const [getEventTokenMutation, _] = useEventTokenMutation(client);

  useEffect(() => {
    const fetchEventData = async () => {
      await getEventTokenMutation(event.id);
    };
    fetchEventData();
  }, [event?.id]);

  return (
    <Layout>
      <Heading textAlign="center" mb="2rem">
        {event.name} kezelése
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
        <ProtectedComponent access={['organizer']}>
          <Button
            text="Regisztrációs form"
            width={['100%', null, '30rem']}
            mb="1rem"
            onClick={() => {
              console.log('Clicked');
            }}
          />
        </ProtectedComponent>
      </Flex>
    </Layout>
  );
}
