import { navigate } from 'gatsby';
import React, { useState } from 'react';

import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import Loading from '../components/Loading';
import { HistoryYears } from '../interfaces';
import { useEventGetHistoryQuery } from '../utils/api/history/EventsGetHistoryQuery';

export default function HistoryPage(): JSX.Element {
  const [allEvent, setAllEvent] = useState<HistoryYears>({});

  const getEvents = useEventGetHistoryQuery((queryData) => {
    const history = queryData.events_getAll.nodes.reduce((acc, curr) => {
      const key = new Date(curr.start).getFullYear();
      (acc[key] = acc[key] || []).push(curr);
      return acc;
    }, {} as HistoryYears);
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
