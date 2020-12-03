import { RouteComponentProps, Router } from '@reach/router';
import { navigate } from 'gatsby';
import React from 'react';

import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import Loading from '../components/Loading';
import RegistrationPage from '../pages-dynamic/events/registration';
import { useEventGetAllQuery } from '../utils/api/index/EventsGetAllQuery';

export default function EventsPage(): JSX.Element {
  return (
    <Router basepath="/events">
      <RegistrationPage path="/:uniqueName/registration" />
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
        linkTo="/events/{uniqueName}/registration"
      />
      <EventSection
        listOfEvents={data?.availableEvents.nodes ?? []}
        color="grayE1"
        linkTo="/events/{uniqueName}/registration"
      />
    </Layout>
  );
}
