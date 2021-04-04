import { navigate } from 'gatsby';
import React, { useState } from 'react';

import { useEventGetHistoryQuery } from '../api/history/EventsGetHistoryQuery';
import { Layout } from '../components/layout/Layout';
import EventSection from '../components/sections/EventSection';
import Loading from '../components/util/Loading';
import { HistoryYears } from '../interfaces';

export default function HistoryPage(): JSX.Element {
  const [allEvent, setAllEvent] = useState<HistoryYears>({});

  const getEvents = useEventGetHistoryQuery((queryData) => {
    const history = [
      ...queryData.registeredEvents.nodes,
      ...queryData.organizedEvents.nodes,
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
    setAllEvent(history);
  });

  if (getEvents.called && getEvents.loading) {
    return <Loading />;
  }

  if (getEvents.error) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <div>Error</div>;
  }

  return (
    <Layout>
      {Object.entries(allEvent)
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
