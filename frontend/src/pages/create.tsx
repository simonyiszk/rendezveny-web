import 'react-quill/dist/quill.snow.css';

import { navigate } from 'gatsby';
import React, { useContext } from 'react';
import { useMutation, useQuery } from 'urql';

import { clubsGetAllQuery } from '../api/details/ClubsGetAllQuery';
import { clubsGetOtherMembersQuery } from '../api/details/ClubsGetOtherMembersQuery';
import { eventCreateMutation } from '../api/details/EventInformationMutation';
import { eventGetUniquenamesQuery } from '../api/index/EventsGetUniquenamesQuery';
import { profileGetNameQuery } from '../api/profile/UserGetSelfQuery';
import EventTabs from '../components/event/EventTabs';
import { Layout } from '../components/layout/Layout';
import LoginComponent from '../components/login/LoginComponent';
import { ceilTime, nextTime } from '../components/util/Calendar';
import Loading from '../components/util/Loading';
import {
  Club,
  ClubGetAllResult,
  EventGetAllResult,
  EventTabProps,
  UserGetSelfResult,
} from '../interfaces';
import { RoleContext } from '../utils/services/RoleContext';
import useToastService from '../utils/services/ToastService';

export default function CreatePage(): JSX.Element {
  const roleContext = useContext(RoleContext);

  const [
    {
      data: otherMembersData,
      fetching: otherMembersFetch,
      error: otherMembersError,
    },
  ] = useQuery<UserGetSelfResult>({
    query: clubsGetOtherMembersQuery,
  });
  const [
    {
      data: clubsGetAllData,
      fetching: clubsGetAllFetch,
      error: clubsGetAllError,
    },
  ] = useQuery<ClubGetAllResult>({
    query: clubsGetAllQuery,
  });
  const [
    {
      data: getUniquenamesData,
      fetching: getUniquenamesFetch,
      error: getUniquenamesError,
    },
  ] = useQuery<EventGetAllResult>({
    query: eventGetUniquenamesQuery,
  });
  const [
    {
      data: profileGetNameData,
      fetching: profileGetNameFetch,
      error: profileGetNameError,
    },
  ] = useQuery<UserGetSelfResult>({
    query: profileGetNameQuery,
  });

  const makeToast = useToastService();

  const [, getEventCreateMutation] = useMutation(eventCreateMutation);

  if (
    otherMembersFetch ||
    clubsGetAllFetch ||
    getUniquenamesFetch ||
    profileGetNameFetch
  ) {
    return <Loading />;
  }

  if (
    otherMembersError ||
    clubsGetAllError ||
    getUniquenamesError ||
    profileGetNameError
  ) {
    if (
      [
        otherMembersError,
        clubsGetAllError,
        getUniquenamesError,
        profileGetNameError,
      ].some(
        (e) => e?.message === '[GraphQL] Unauthorized to perform operation',
      )
    ) {
      if (!roleContext.isLoggedIn) return <LoginComponent />;
      navigate('/');
    }
    return <div />;
  }

  const uniqueNames = getUniquenamesData
    ? getUniquenamesData.events_getAll.nodes.map((e) => e.uniqueName)
    : [];
  const allClubs = clubsGetAllData
    ? clubsGetAllData.clubs_getAll.nodes
        .map((c) => {
          return { id: c.id, name: c.name } as Club;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];
  const managedClubs = otherMembersData
    ? otherMembersData.users_getSelf.clubMemberships.nodes.map((m) => {
        return { id: m.club.id, name: m.club.name } as Club;
      })
    : [];

  const handleSubmit = (values: EventTabProps): void => {
    getEventCreateMutation({
      name: values.name,
      description: values.description,
      start: values.start.toISOString(),
      end: values.end.toISOString(),
      registrationStart: values.regStart.toISOString(),
      registrationEnd: values.regEnd.toISOString(),
      place: values.place,
      organizerIds: values.organizers.map((o) => o.id),
      chiefOrganizerIds: values.chiefOrganizers.map((o) => o.id),
      isClosedEvent: values.isClosed,
      capacity: parseInt(values.capacity, 10) || 0,
      uniqueName: values.reglink,
      registrationAllowed: values.application,
      hostingClubIds: values.hostingClubs.map((c) => c.id),
    }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast('Új esemény létrehozva');
        navigate('/');
      }
    });
  };

  const oneHourLater = ceilTime(new Date(), 60);
  const twoHourLater = nextTime(oneHourLater, 60);

  return (
    <Layout>
      <EventTabs
        uniqueNames={uniqueNames}
        allClubs={allClubs}
        showedClubs={allClubs}
        managedClubs={managedClubs}
        handleSubmit={handleSubmit}
        withApplication={false}
        initialValues={{
          name: '',
          description: '<p><br></p>',
          start: oneHourLater,
          end: twoHourLater,
          regStart: oneHourLater,
          regEnd: twoHourLater,
          place: '',
          organizers: [],
          chiefOrganizers: profileGetNameData
            ? [profileGetNameData.users_getSelf]
            : [],
          isClosed: true,
          capacity: '',
          reglink: '',
          application: true,
          hostingClubs: managedClubs,
        }}
        userSelf={profileGetNameData?.users_getSelf}
      />
    </Layout>
  );
}
