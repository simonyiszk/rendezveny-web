import React, { useEffect, useState } from 'react';

import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import { Event, HistoryYear } from '../interfaces';

export default function HistoryPage(): JSX.Element {
  const [histories, setHistories] = useState<HistoryYear[]>([]);

  useEffect(() => {
    setHistories([
      {
        year: 2020,
        events: [
          { id: 1, name: 'Test event 1', startDate: '2020-11-10' },
          { id: 4, name: 'Test event 4', startDate: '2020-11-10' },
        ],
      },
      {
        year: 2019,
        events: [
          { id: 1, name: 'Test event 1', startDate: '2020-11-10' },
          { id: 4, name: 'Test event 4', startDate: '2020-11-10' },
        ],
      },
    ]);
  }, []);

  return (
    <Layout>
      {histories.map((h) => (
        <EventSection
          text={h.year.toString()}
          listOfEvents={h.events}
          withControls={false}
        />
      ))}
    </Layout>
  );
}
