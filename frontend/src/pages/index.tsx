import { gql, useQuery } from '@apollo/client';
import { navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../components/Button';
import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import SectionHeader from '../components/SectionHeader';
import { Event } from '../interfaces';
import { getToken } from '../utils/TokenContainer';

const userQueryGQL = gql`
  query {
    clubs_getAll {
      nodes {
        id
        name
      }
    }
  }
`;

export default function IndexPage(): JSX.Element {
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [appliedEvents, setAppliedEvents] = useState<Event[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);

  /* useEffect(() => {
    setOrganizedEvents([
      { id: 1, name: 'Test event 1', startDate: '2020-11-10' },
      { id: 4, name: 'Test event 4', startDate: '2020-11-10' },
    ]);
    setAppliedEvents([
      { id: 2, name: 'Test event 2', startDate: '2020-11-10' },
    ]);
    setOtherEvents([{ id: 3, name: 'Test event 3', startDate: '2020-11-10' }]);
  }, []); */
  const { called, loading, error, data } = useQuery(userQueryGQL);
  if (called && loading) return <div>Loading</div>;

  // Show error message if lazy query fails
  if (error) {
    navigate('/login');
    return <div>Error {error.message}</div>;
  }

  return (
    <Layout>
      <p>Success</p>
      {data.clubs_getAll.nodes.map((c) => (
        <div key={c.id}>{c.name}</div>
      ))}
    </Layout>
  );

  /* return (
    <Layout>
      <Button
        text="Rendezvény létrehozása"
        width={['100%', null, '15rem']}
        onClick={() => {
          console.log('Clicked');
        }}
      />
      <EventSection text="Kezelt rendezvények" listOfEvents={organizedEvents} />
      <EventSection
        text="Regisztrált rendezvények"
        listOfEvents={appliedEvents}
      />
      <EventSection text="Közelgő rendezvények" listOfEvents={otherEvents} />
    </Layout>
  ); */
}
