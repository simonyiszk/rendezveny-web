import './main.css';

import { Box } from '@chakra-ui/react';
import { Link } from 'gatsby';
import React from 'react';
import { useQuery } from 'urql';

import { eventGetAllQuery } from '../api/index/EventsGetAllQuery';
import { Layout } from '../components/layout/Layout';
import LoginComponent from '../components/login/LoginComponent';
import EventSection from '../components/sections/EventSection';
import Loading from '../components/util/Loading';
import { AllEventResult } from '../interfaces';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

export default function IndexPage(): JSX.Element {
  const [{ data, fetching, error }] = useQuery<AllEventResult>({
    query: eventGetAllQuery,
    requestPolicy: 'cache-and-network',
  });

  if (fetching) {
    return <Loading />;
  }

  if (error) {
    if (error?.message === '[GraphQL] Unauthorized to perform operation') {
      return <LoginComponent />;
    }
    return <div />;
  }

  const registeredEvents = data?.registeredEvents.nodes ?? [];
  const availableEvents = data?.availableEvents.nodes ?? [];

  return (
    <Layout>
      {registeredEvents.length > 0 && (
        <EventSection
          listOfEvents={registeredEvents}
          color="simonyi"
          linkTo="/events/{uniqueName}"
          sectionText="Regisztrált események"
        />
      )}
      <EventSection
        listOfEvents={availableEvents}
        color="grayE1"
        linkTo="/events/{uniqueName}"
        sectionText="Elérhető események"
      />
      {registeredEvents.length === 0 && availableEvents.length === 0 && (
        <Box>
          Nincs elérhető esemény.{' '}
          <ProtectedComponent accessText={['admin', 'manager']}>
            <Link to="/create">
              <Box color="simonyi" fontWeight="bold" display="inline-block">
                Hozz létre egyet.
              </Box>
            </Link>
          </ProtectedComponent>
        </Box>
      )}
    </Layout>
  );
}
