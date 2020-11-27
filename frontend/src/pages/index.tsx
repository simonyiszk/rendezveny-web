import { gql, useQuery } from '@apollo/client';
import { navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../components/Button';
import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import SectionHeader from '../components/SectionHeader';
import { Event } from '../interfaces';
import { useEventGetAllQuery } from '../utils/api/index/EventsGetAllQuery';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

export default function IndexPage(): JSX.Element {
  const getEvents = useEventGetAllQuery((queryData) => {
    setOrganizedEvents(queryData.organizedEvents.nodes);
    setRegisteredEvents(queryData.registeredEvents.nodes);
    setAvailableEvents(queryData.availableEvents.nodes);
  });

  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);

  if (getEvents.error) {
    navigate('/login');
    return <div>Error {error.message}</div>;
  }

  return (
    <Layout>
      <ProtectedComponent>
        <LinkButton
          text="Rendezvény létrehozása"
          width={['100%', null, '15rem']}
          to="/manage/information"
          state={{ event: null }}
        />
      </ProtectedComponent>
      <EventSection text="Kezelt rendezvények" listOfEvents={organizedEvents} />
      <EventSection
        text="Regisztrált rendezvények"
        listOfEvents={registeredEvents}
      />
      <EventSection
        text="Közelgő rendezvények"
        listOfEvents={availableEvents}
      />
    </Layout>
  );
}
