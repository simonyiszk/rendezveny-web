import 'react-quill/dist/quill.snow.css';

import { navigate } from 'gatsby';
import React, { useState } from 'react';

import { useClubsGetAllQuery } from '../api/details/ClubsGetAllQuery';
import { useClubsGetOtherMembersQuery } from '../api/details/ClubsGetOtherMembersQuery';
import { useEventCreateMutation } from '../api/details/EventInformationMutation';
import { useEventGetUniquenamesQuery } from '../api/index/EventsGetUniquenamesQuery';
import { useProfileGetNameQuery } from '../api/profile/UserGetSelfQuery';
import EventTabs from '../components/event/EventTabs';
import { Layout } from '../components/layout/Layout';
import Loading from '../components/util/Loading';
import { Club, EventTabProps } from '../interfaces';
import useToastService from '../utils/services/ToastService';

export default function CreatePage(): JSX.Element {
  const [uniqueNames, setUniqueNames] = useState<string[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [managedClubs, setManagedClubs] = useState<Club[]>([]);

  const {
    called: getSelfNameCalled,
    loading: getSelfNameLoading,
    data: getSelfNameData,
  } = useProfileGetNameQuery();

  const [
    getUniquenames,
    {
      called: getUniquenamesCalled,
      loading: getUniquenamesLoading,
      error: getUniquenamesError,
    },
  ] = useEventGetUniquenamesQuery((queryData) => {
    setUniqueNames(queryData.events_getAll.nodes.map((e) => e.uniqueName));
  });

  const [
    getClubs,
    { called: getClubsCalled, loading: getClubsLoading, error: getClubsError },
  ] = useClubsGetAllQuery((queryData) => {
    setAllClubs(
      queryData.clubs_getAll.nodes
        .map((c) => {
          return { id: c.id, name: c.name } as Club;
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  });

  const {
    called: getOtherMembersCalled,
    loading: getOtherMembersLoading,
    error: getOtherMembersError,
  } = useClubsGetOtherMembersQuery((queryData) => {
    const resultManagedClubs = queryData.users_getSelf.clubMemberships.nodes.map(
      (m) => {
        return { id: m.club.id, name: m.club.name } as Club;
      },
    );
    getClubs();
    getUniquenames();
    setManagedClubs(resultManagedClubs);
  });

  const makeToast = useToastService();

  const [getEventCreateMutation] = useEventCreateMutation({
    onCompleted: () => {
      makeToast('Új esemény létrehozva');
      navigate('/');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });

  if (
    (getOtherMembersCalled && getOtherMembersLoading) ||
    (getClubsCalled && getClubsLoading) ||
    (getUniquenamesCalled && getUniquenamesLoading) ||
    (getSelfNameCalled && getSelfNameLoading)
  ) {
    return <Loading />;
  }

  if (getOtherMembersError || getClubsError || getUniquenamesError) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <div>Error</div>;
  }

  const handleSubmit = (values: EventTabProps): void => {
    getEventCreateMutation(
      values.name,
      values.description,
      values.start.toISOString(),
      values.end.toISOString(),
      values.regStart.toISOString(),
      values.regEnd.toISOString(),
      values.place,
      values.organizers.map((o) => o.id),
      values.chiefOrganizers.map((o) => o.id),
      values.isClosed,
      parseInt(values.capacity, 10) || 0,
      values.reglink,
      values.application,
      values.hostingClubs.map((c) => c.id),
    );
  };

  return (
    <Layout>
      <EventTabs
        uniqueNames={uniqueNames}
        allClubs={allClubs}
        showedClubs={allClubs}
        handleSubmit={handleSubmit}
        withApplication={false}
        initialValues={{
          name: '',
          description: '<p><br></p>',
          start: new Date(),
          end: new Date(),
          regStart: new Date(),
          regEnd: new Date(),
          place: '',
          organizers: [],
          chiefOrganizers: getSelfNameData
            ? [getSelfNameData.users_getSelf]
            : [],
          isClosed: true,
          capacity: '',
          reglink: '',
          application: true,
          hostingClubs: managedClubs,
        }}
      />
    </Layout>
  );
}
