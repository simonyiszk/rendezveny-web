import 'react-quill/dist/quill.snow.css';

import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'urql';

import { clubsGetAllQuery } from '../../api/details/ClubsGetAllQuery';
import { eventGetOrganizersQuery } from '../../api/details/EventGetOrganizersQuery';
import { eventInformationMutation } from '../../api/details/EventInformationMutation';
import { eventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { eventGetUniquenamesQuery } from '../../api/index/EventsGetUniquenamesQuery';
import {
  profileGetNameQuery,
  profileGetSelfQuery,
} from '../../api/profile/UserGetSelfQuery';
import {
  eventsGetTokenMutationID,
  eventsGetTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Backtext from '../../components/control/Backtext';
import EventTabs from '../../components/event/EventTabs';
import { Layout } from '../../components/layout/Layout';
import LoginComponent from '../../components/login/LoginComponent';
import Loading from '../../components/util/Loading';
import {
  Club,
  ClubGetAllResult,
  ClubRole,
  Event,
  EventGetAllResult,
  EventGetOneResult,
  EventTabProps,
  User,
  UserGetSelfResult,
} from '../../interfaces';
import { RoleContext } from '../../utils/services/RoleContext';
import useToastService from '../../utils/services/ToastService';
import { setEventToken } from '../../utils/token/TokenContainer';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
  uniqueName?: string;
}

export default function DetailsPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event } = state as PageState;

  const roleContext = useContext(RoleContext);

  const [
    { fetching: eventTokenIDFetch, error: eventTokenIDError },
    getEventTokenMutationID,
  ] = useMutation(eventsGetTokenMutationID);
  const [
    {
      data: eventTokenUNData,
      fetching: eventTokenUNFetch,
      error: eventTokenUNError,
    },
    getEventTokenMutationUN,
  ] = useMutation(eventsGetTokenMutationUN);

  const [
    {
      data: getCurrentEventData,
      fetching: getCurrentEventFetch,
      error: getCurrentEventError,
    },
  ] = useQuery<EventGetOneResult>({
    query: eventGetInformationQuery,
    variables: { uniqueName },
    pause: eventTokenUNData === undefined,
  });
  const eventData = event ?? getCurrentEventData?.events_getOne;

  const access = roleContext.isAdmin || roleContext.isManagerOfHost;

  const originalUniqueName = eventData?.uniqueName;

  const [
    {
      data: getOrganizersData,
      fetching: getOrganizersFetch,
      error: getOrganizersError,
    },
  ] = useQuery<EventGetOneResult>({
    query: eventGetOrganizersQuery,
    variables: { id: eventData?.id },
    pause: eventData === undefined,
  });

  /* const allUsers =
    getOrganizersData?.events_getOne.relations.nodes.map((u) => {
      return {
        id: u.userId,
        name: u.name,
      } as User;
    }) ?? []; */
  const resultOrganizers =
    getOrganizersData?.events_getOne?.organizers.nodes.map((u) => {
      return {
        id: u.userId,
        name: u.name,
      } as User;
    }) ?? [];
  const resultChiefOrganizers =
    getOrganizersData?.events_getOne?.chiefOrganizers.nodes.map((u) => {
      return {
        id: u.userId,
        name: u.name,
      } as User;
    }) ?? [];
  const resultOrganizerClubs =
    getOrganizersData?.events_getOne?.hostingClubs.map((c) => {
      return { id: c.id, name: c.name } as Club;
    }) ?? [];

  const initialValues = getOrganizersData?.events_getOne
    ? {
        name: getOrganizersData.events_getOne.name,
        description: getOrganizersData.events_getOne.description,
        start: new Date(getOrganizersData.events_getOne.start),
        end: new Date(getOrganizersData.events_getOne.end),
        regStart: new Date(getOrganizersData.events_getOne.registrationStart),
        regEnd: new Date(getOrganizersData.events_getOne.registrationEnd),
        place: getOrganizersData.events_getOne.place ?? '',
        isClosed: getOrganizersData.events_getOne.isClosedEvent ?? true,
        capacity: `${getOrganizersData.events_getOne.capacity || ''}`,
        reglink: getOrganizersData.events_getOne.uniqueName ?? '',
        application:
          getOrganizersData.events_getOne.registrationAllowed ?? true,
        organizers: resultOrganizers,
        chiefOrganizers: resultChiefOrganizers,
        hostingClubs: resultOrganizerClubs,
      }
    : undefined;

  const [
    {
      data: getUniqueNamesData,
      fetching: getUniqueNamesFetch,
      error: getUniqueNamesError,
    },
  ] = useQuery<EventGetAllResult>({
    query: eventGetUniquenamesQuery,
    variables: { id: eventData?.id },
    pause: eventData === undefined,
  });

  const uniqueNames =
    getUniqueNamesData?.events_getAll.nodes.map((e) => e.uniqueName) ?? [];

  const [
    { data: getClubsData, fetching: getClubsFetch, error: getClubsError },
  ] = useQuery<ClubGetAllResult>({
    query: clubsGetAllQuery,
    variables: { id: eventData?.id },
    pause: eventData === undefined,
  });
  const allClubs = getClubsData
    ? getClubsData.clubs_getAll.nodes
        .map((c) => {
          return { id: c.id, name: c.name } as Club;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const [
    {
      data: getOwnClubsData,
      fetching: getOwnClubsFetch,
      error: getOwnClubsError,
    },
  ] = useQuery<UserGetSelfResult>({
    query: profileGetSelfQuery,
    variables: { id: eventData?.id },
    pause: eventData === undefined,
  });

  const ownClubs =
    getOwnClubsData?.users_getSelf.clubMemberships.nodes.map((c) => {
      return { id: c.club.id, name: c.club.name } as Club;
    }) ?? [];
  const managedClubs =
    getOwnClubsData?.users_getSelf.clubMemberships.nodes
      .filter((c) => c.role === ClubRole[ClubRole.CLUB_MANAGER])
      .map((c) => {
        return { id: c.club.id, name: c.club.name } as Club;
      }) ?? [];

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

  const [, getEventInformationMutation] = useMutation(eventInformationMutation);

  useEffect(() => {
    if (event)
      getEventTokenMutationID({ id: event.id }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
    else if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          setEventToken(res.data.events_getToken.eventToken);
          if (roleContext.setEventRelation)
            roleContext.setEventRelation(res.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    getCurrentEventFetch ||
    eventTokenIDFetch ||
    eventTokenUNFetch ||
    (!event && !getCurrentEventData) ||
    getOrganizersFetch ||
    getUniqueNamesFetch ||
    getClubsFetch ||
    getOwnClubsFetch ||
    profileGetNameFetch
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    getCurrentEventError ||
    eventTokenIDError ||
    eventTokenUNError ||
    getOrganizersError ||
    getUniqueNamesError ||
    getClubsError ||
    getOwnClubsError ||
    profileGetNameError
  ) {
    if (
      [
        getCurrentEventError,
        eventTokenIDError,
        eventTokenUNError,
        getOrganizersError,
        getUniqueNamesError,
        getClubsError,
        getOwnClubsError,
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

  const handleSubmit = (values: EventTabProps): void => {
    getEventInformationMutation({
      id: event?.id ?? getCurrentEventData?.events_getOne.id,
      name: values.name,
      description: values.description,
      start: values.start.toISOString(),
      end: values.end.toISOString(),
      registrationStart: values.regStart.toISOString(),
      registrationEnd: values.regEnd.toISOString(),
      place: values.place,
      organizerIds: values.organizers.map((o) => o.id),
      chiefOrganizerIds: values.chiefOrganizers.map((o) => o.id),
      isClosedEvent: access ? values.isClosed : undefined,
      capacity: parseInt(values.capacity, 10) || 0,
      uniqueName: values.reglink,
      registrationAllowed: values.application,
      hostingClubIds: access ? values.hostingClubs.map((c) => c.id) : undefined,
    }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast('Sikeres szerkesztés');
      }
    });
  };

  return (
    <Layout>
      <Backtext
        text="Vissza a rendezvény kezeléséhez"
        to={`/manage/${event?.uniqueName}`}
        state={{ event }}
      />
      <EventTabs
        accessCMAdmin={access}
        uniqueNames={uniqueNames}
        originalUniqueName={originalUniqueName}
        allClubs={allClubs}
        showedClubs={
          access
            ? allClubs
            : allClubs.filter((c) => ownClubs.map((o) => o.id).includes(c.id))
        }
        managedClubs={managedClubs}
        handleSubmit={handleSubmit}
        withApplication
        initialValues={initialValues}
        userSelf={profileGetNameData?.users_getSelf}
      />
    </Layout>
  );
}
DetailsPage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
