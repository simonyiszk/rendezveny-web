import { RouteComponentProps, Router } from '@reach/router';
import { navigate } from 'gatsby';
import React from 'react';

import { useEventGetAllQuery } from '../api/index/EventsGetAllQuery';
import { Layout } from '../components/layout/Layout';
import EventSection from '../components/sections/EventSection';
import Loading from '../components/util/Loading';
import EventShowPage from '../pages-dynamic/events/events';
import RegistrationPage from '../pages-dynamic/events/registration';

export default function EventsPage(): JSX.Element {
  return (
    <Router basepath="/events">
      <RegistrationPage path="/:uniqueName/registration" />
      <EventShowPage path="/:uniqueName" />
      <EventsBrowsePage default />
    </Router>
  );
}

function EventsBrowsePage(_props: RouteComponentProps): JSX.Element {
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
