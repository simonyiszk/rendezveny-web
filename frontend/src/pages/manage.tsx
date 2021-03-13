import { RouteComponentProps, Router } from '@reach/router';
import { navigate } from 'gatsby';
import React from 'react';

import { useEventGetAllQuery } from '../api/index/EventsGetAllQuery';
import LinkButton from '../components/control/LinkButton';
import { Layout } from '../components/layout/Layout';
import EventSection from '../components/sections/EventSection';
import Loading from '../components/util/Loading';
import DetailsPage from '../pages-dynamic/manage/details';
import FormeditorPage from '../pages-dynamic/manage/formeditor';
import HRTablePage from '../pages-dynamic/manage/hrtable';
import HRTableEditPage from '../pages-dynamic/manage/hrtable/edit';
import EventManagePage from '../pages-dynamic/manage/manage';
import MembersPage from '../pages-dynamic/manage/members';
import EditMemberRegPage from '../pages-dynamic/manage/members/editreg';
import ShowMemberRegPage from '../pages-dynamic/manage/members/showreg';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

export default function ManagePage(): JSX.Element {
  return (
    <Router basepath="/manage">
      <EditMemberRegPage path="/:uniqueName/members/editreg" />
      <ShowMemberRegPage path="/:uniqueName/members/showreg" />
      <MembersPage path="/:uniqueName/members" />
      <DetailsPage path="/:uniqueName/details" />
      <HRTableEditPage path="/:uniqueName/hrtable/edit" />
      <HRTablePage path="/:uniqueName/hrtable" />
      <FormeditorPage path="/:uniqueName/formeditor" />
      <EventManagePage path="/:uniqueName" />
      <ManageBrowsePage default />
    </Router>
  );
}

function ManageBrowsePage(_props: RouteComponentProps): JSX.Element {
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
      <ProtectedComponent accessText={['admin', 'manager']}>
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
