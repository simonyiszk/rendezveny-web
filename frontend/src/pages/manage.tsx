import { navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';

import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import Loading from '../components/Loading';
import { useEventGetAllQuery } from '../utils/api/index/EventsGetAllQuery';
import ProtectedComponent from '../utils/protection/ProtectedComponent';
import { isAdmin, isClubManager } from '../utils/token/TokenContainer';

export default function ManagePage(): JSX.Element {
  const [accessAdminCM, setAccessAdminCM] = useState(false);

  const { called, loading, error, data } = useEventGetAllQuery();

  useEffect(() => {
    setAccessAdminCM(isAdmin() || isClubManager());
  }, []);

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
      <ProtectedComponent access={accessAdminCM}>
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
