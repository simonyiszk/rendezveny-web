import { navigate } from 'gatsby';
import React, { useState } from 'react';

import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import Loading from '../components/Loading';
import { Event } from '../interfaces';
import { useEventGetAllQuery } from '../utils/api/index/EventsGetAllQuery';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

export default function ManagePage(): JSX.Element {
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);

  const getEvents = useEventGetAllQuery((queryData) => {
    setOrganizedEvents(queryData.organizedEvents.nodes);
  });

  if (getEvents.called && getEvents.loading) {
    return <Loading />;
  }

  if (getEvents.error) {
    if (typeof window !== 'undefined') {
      navigate('/login');
    }
    return <div>Error</div>;
  }

  return (
    <Layout>
      <ProtectedComponent access={['admin, club_manager']}>
        <LinkButton
          text="Rendezvény létrehozása"
          width={['100%', null, '15rem']}
          to="/manage/details"
          state={{ event: null }}
        />
      </ProtectedComponent>
      <EventSection
        listOfEvents={organizedEvents}
        color="simonyi"
        linkTo="/manage/event"
      />
    </Layout>
  );
}
