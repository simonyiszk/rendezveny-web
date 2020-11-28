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
    setRegisteredEvents(queryData.registeredEvents.nodes);
    setAvailableEvents(queryData.availableEvents.nodes);
  });

  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);

  if (getEvents.error) {
    navigate('/login');
    return <div>Error</div>;
  }

  return (
    <Layout>
      <EventSection
        listOfEvents={registeredEvents}
        color="simonyi"
        linkTo="/registration"
      />
      <EventSection
        listOfEvents={availableEvents}
        color="gray"
        linkTo="/registration"
      />
    </Layout>
  );
}
