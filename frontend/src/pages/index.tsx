import { gql, useQuery } from '@apollo/client';
import { navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../components/Button';
import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import SectionHeader from '../components/SectionHeader';
import { Event } from '../interfaces';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

const userQueryGQL = gql`
  query eventsGetAll {
    events_getAll {
      nodes {
        id
        name
        description
        place
        start
        end
        registrationStart
        registrationEnd
      }
    }
  }
`;

export default function IndexPage(): JSX.Element {
  const { called, loading, error, data } = useQuery(userQueryGQL);
  if (called && loading) return <div>Loading</div>;

  // Show error message if lazy query fails
  if (error) {
    navigate('/login');
    return <div>Error {error.message}</div>;
  }
  const organizedEvents = (events) => {
    return events;
  };
  const appliedEvents = (events) => {
    return events;
  };
  const otherEvents = (events) => {
    return events;
  };

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
      <EventSection
        text="Kezelt rendezvények"
        listOfEvents={organizedEvents(data.events_getAll.nodes)}
      />
      <EventSection
        text="Regisztrált rendezvények"
        listOfEvents={appliedEvents(data.events_getAll.nodes)}
      />
      <EventSection
        text="Közelgő rendezvények"
        listOfEvents={otherEvents(data.events_getAll.nodes)}
      />
    </Layout>
  );
}
