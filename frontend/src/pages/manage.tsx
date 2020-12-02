import { navigate } from 'gatsby';
import React from 'react';

import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import Loading from '../components/Loading';
import { useEventGetAllQuery } from '../utils/api/index/EventsGetAllQuery';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

export default function ManagePage(): JSX.Element {
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
      <ProtectedComponent access={['admin, club_manager']}>
        <LinkButton
          text="Rendezvény létrehozása"
          width={['100%', null, '15rem']}
          to="/manage/create"
          state={{ event: null }}
        />
      </ProtectedComponent>
      <EventSection
        listOfEvents={data?.organizedEvents.nodes ?? []}
        color="simonyi"
        linkTo="/manage/event"
      />
    </Layout>
  );
}
