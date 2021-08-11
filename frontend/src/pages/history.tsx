import { navigate } from 'gatsby';
import React, { useContext } from 'react';
import { useQuery } from 'urql';

import { eventGetHistoryQuery } from '../api/history/EventsGetHistoryQuery';
import { Layout } from '../components/layout/Layout';
import LoginComponent from '../components/login/LoginComponent';
import EventSection from '../components/sections/EventSection';
import Loading from '../components/util/Loading';
import { HistoryResult, HistoryYears } from '../interfaces';
import { RoleContext } from '../utils/services/RoleContext';

export default function HistoryPage(): JSX.Element {
  const roleContext = useContext(RoleContext);

  const [{ data, fetching, error }] = useQuery<HistoryResult>({
    query: eventGetHistoryQuery,
  });

  if (fetching) {
    return <Loading />;
  }

  if (error) {
    if (error?.message === '[GraphQL] Unauthorized to perform operation') {
      if (!roleContext.isLoggedIn) return <LoginComponent />;
      navigate('/');
    }
    return <div />;
  }

  const allEvent = (): HistoryYears => {
    if (!data) return {};
    const history = [
      ...data.registeredEvents.nodes,
      ...data.organizedEvents.nodes,
    ].reduce((acc, curr) => {
      const key = new Date(curr.start).getFullYear();
      (acc[key] = acc[key] || []).push(curr);
      return acc;
    }, {} as HistoryYears);
    Object.entries(history).forEach(([key, value]) => {
      history[key] = value.sort(
        (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
      );
    });
    return history;
  };

  return (
    <Layout>
      {Object.entries(allEvent())
        .sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10))
        .map(([key, value]) => (
          <EventSection
            key={key}
            listOfEvents={value}
            color="grayE1"
            sectionText={key}
          />
        ))}
    </Layout>
  );
}
