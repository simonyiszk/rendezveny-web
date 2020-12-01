import { navigate } from 'gatsby';
import React, { useState } from 'react';

import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import Loading from '../components/Loading';
import { Event } from '../interfaces';
import { useEventGetAllQuery } from '../utils/api/index/EventsGetAllQuery';

export default function IndexPage(): JSX.Element {
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);

  const getEvents = useEventGetAllQuery((queryData) => {
    console.log('INDEX', queryData);
    setRegisteredEvents(queryData.registeredEvents.nodes);
    setAvailableEvents(queryData.availableEvents.nodes);
  });

  if (getEvents.called && getEvents.loading) {
    return <Loading />;
  }

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
        color="grayE1"
        linkTo="/registration"
      />
    </Layout>
  );
}
