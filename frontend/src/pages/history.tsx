import React, { useEffect, useState } from 'react';

import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import { Event, HistoryYears } from '../interfaces';
import { useEventGetHistoryQuery } from '../utils/api/history/EventsGetHistoryQuery';

export default function HistoryPage(): JSX.Element {
  const getEvents = useEventGetHistoryQuery((queryData) => {
    const history = queryData.events_getAll.nodes.reduce((acc, curr) => {
      const key = new Date(curr.start).getFullYear();
      (acc[key] = acc[key] || []).push(curr);
      return acc;
    }, {} as HistoryYears);
    setAllEvent(history);
  });

  const [allEvent, setAllEvent] = useState<HistoryYears>({});

  if (getEvents.error) {
    // navigate('/');
    return <div>Error</div>;
  }

  return (
    <Layout>
      {Object.entries(allEvent).map(([key, value]) => (
        <EventSection
          key={key}
          text={key}
          listOfEvents={value}
          withControls={false}
        />
      ))}
    </Layout>
  );
}
