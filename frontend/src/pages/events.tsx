import { RouteComponentProps, Router } from '@reach/router';
import { navigate } from 'gatsby';
import React from 'react';

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
  if (typeof window !== 'undefined') {
    navigate('/');
  }

  return <Loading />;
}
