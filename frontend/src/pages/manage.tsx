import { RouteComponentProps, Router } from '@reach/router';
import { navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';

import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import Loading from '../components/Loading';
import DetailsPage from '../pages-dynamic/manage/details';
import FormeditorPage from '../pages-dynamic/manage/formeditor';
import HRTablePage from '../pages-dynamic/manage/hrtable';
import HRTableNewPage from '../pages-dynamic/manage/hrtable/new';
import EventManagePage from '../pages-dynamic/manage/manage';
import MembersPage from '../pages-dynamic/manage/members';
import EditMemberRegPage from '../pages-dynamic/manage/members/editreg';
import ShowMemberRegPage from '../pages-dynamic/manage/members/showreg';
import { useEventGetAllQuery } from '../utils/api/index/EventsGetAllQuery';
import ProtectedComponent from '../utils/protection/ProtectedComponent';
import { isAdmin, isClubManager } from '../utils/token/TokenContainer';

export default function ManagePage(): JSX.Element {
  return (
    <Router basepath="/manage">
      <EditMemberRegPage path="/:uniqueName/members/editreg" />
      <ShowMemberRegPage path="/:uniqueName/members/showreg" />
      <MembersPage path="/:uniqueName/members" />
      <DetailsPage path="/:uniqueName/details" />
      <HRTableNewPage path="/:uniqueName/hrtable/new" />
      <HRTablePage path="/:uniqueName/hrtable" />
      <FormeditorPage path="/:uniqueName/formeditor" />
      <EventManagePage path="/:uniqueName" />
      <ManageBrowsePage default />
    </Router>
  );
}

function ManageBrowsePage(_props: RouteComponentProps): JSX.Element {
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
          to="/create"
          state={{ event: null }}
        />
      </ProtectedComponent>
      <EventSection
        listOfEvents={data?.organizedEvents.nodes ?? []}
        color="simonyi"
        linkTo="/manage/{uniqueName}"
      />
    </Layout>
  );
}
