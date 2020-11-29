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

export default function ManagePage(): JSX.Element {
  const getEvents = useEventGetAllQuery((queryData) => {
    setOrganizedEvents(queryData.organizedEvents.nodes);
  });

  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);

  if (getEvents.error) {
    navigate('/login');
    return <div>Error</div>;
  }

  return (
    <Layout>
      <ProtectedComponent>
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
