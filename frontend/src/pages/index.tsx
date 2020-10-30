import React, { useEffect, useState } from 'react';

import Button from '../components/Button';
import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import SectionHeader from '../components/SectionHeader';
import { Event } from '../interfaces';

export default function IndexPage(): JSX.Element {
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [appliedEvents, setAppliedEvents] = useState<Event[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);

  useEffect(() => {
    setOrganizedEvents([
      { id: 1, name: 'Test event 1', startDate: '2020-11-10' },
      { id: 4, name: 'Test event 4', startDate: '2020-11-10' },
    ]);
    setAppliedEvents([
      { id: 2, name: 'Test event 2', startDate: '2020-11-10' },
    ]);
    setOtherEvents([{ id: 3, name: 'Test event 3', startDate: '2020-11-10' }]);
  }, []);

  return (
    <Layout>
      <Button
        text="Rendezvény létrehozása"
        width={['100%', null, '15rem']}
        onClick={() => {
          console.log('Clicked');
        }}
      />
      <EventSection text="Kezelt rendezvények" listOfEvents={organizedEvents} />
      <EventSection
        text="Regisztrált rendezvények"
        listOfEvents={appliedEvents}
      />
      <EventSection text="Közelgő rendezvények" listOfEvents={otherEvents} />
    </Layout>
  );
}
