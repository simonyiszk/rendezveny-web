import { Box } from '@chakra-ui/react';
import { Link, navigate } from 'gatsby';
import React from 'react';

import { useEventGetAllQuery } from '../api/index/EventsGetAllQuery';
import { Layout } from '../components/layout/Layout';
import EventSection from '../components/sections/EventSection';
import Loading from '../components/util/Loading';

export default function IndexPage(): JSX.Element {
  const { called, loading, error, data } = useEventGetAllQuery();

  if (called && loading) {
    return <Loading />;
  }

  if (error) {
    if (typeof window !== 'undefined') {
      navigate('/login');
    }
    return <div>Error</div>;
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
          <Link to="/create">
            <Box color="simonyi" fontWeight="bold" display="inline-block">
              Hozz létre egyet.
            </Box>
          </Link>
        </Box>
      )}
    </Layout>
  );
}
