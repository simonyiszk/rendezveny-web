import { navigate } from 'gatsby';
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

  return (
    <Layout>
      <EventSection
        listOfEvents={data?.registeredEvents.nodes ?? []}
        color="simonyi"
        linkTo="/events/{uniqueName}"
      />
      <EventSection
        listOfEvents={data?.availableEvents.nodes ?? []}
        color="grayE1"
        linkTo="/events/{uniqueName}"
      />
    </Layout>
  );
}
