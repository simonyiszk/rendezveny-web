import 'react-quill/dist/quill.snow.css';

import { useApolloClient } from '@apollo/client';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { useClubsGetAllQuery } from '../../api/details/ClubsGetAllQuery';
import { useEventGetOrganizersQuery } from '../../api/details/EventGetOrganizersQuery';
import { useEventInformationMutation } from '../../api/details/EventInformationMutation';
import { useEventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { useEventGetUniquenamesQuery } from '../../api/index/EventsGetUniquenamesQuery';
import { useProfileGetSelfQueryLazy } from '../../api/profile/UserGetSelfQuery';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import EventTabs from '../../components/event/EventTabs';
import { Layout } from '../../components/layout/Layout';
import Loading from '../../components/util/Loading';
import { Club, ClubRole, Event, EventTabProps, User } from '../../interfaces';
import useToastService from '../../utils/services/ToastService';
import { isAdmin, isClubManagerOf } from '../../utils/token/TokenContainer';

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

  const [accessCMAdmin, setAccessCMAdmin] = useState(false);

  const [, setAllUsers] = useState<User[]>([]);
  const [uniqueNames, setUniqueNames] = useState<string[]>([]);
  const [originalUniqueName, setOriginalUniqueName] = useState('');
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [managedClubs, setManagedClubs] = useState<Club[]>([]);
  const [ownClubs, setOwnClubs] = useState<Club[]>([]);
  const [initialValues, setInitialValues] = useState<EventTabProps>();

  const [
    getOrganizers,
    {
      called: getOrganizersCalled,
      loading: getOrganizersLoading,
      error: getOrganizersError,
    },
  ] = useEventGetOrganizersQuery((queryData) => {
    const resultAllUser = queryData.events_getOne.relations.nodes.map((u) => {
      return {
        id: u.userId,
        name: u.name,
      } as User;
    });
    const resultOrganizers = queryData.events_getOne.organizers.nodes.map(
      (u) => {
        return {
          id: u.userId,
          name: u.name,
        } as User;
      },
    );
    const resultChiefOrganizers = queryData.events_getOne.chiefOrganizers.nodes.map(
      (u) => {
        return {
          id: u.userId,
          name: u.name,
        } as User;
      },
    );
    const resultOrganizerClubs = queryData.events_getOne.hostingClubs.map(
      (c) => {
        return { id: c.id, name: c.name } as Club;
      },
    );

    setAllUsers(resultAllUser);
    setInitialValues({
      name: queryData.events_getOne.name,
      description: queryData.events_getOne.description,
      start: new Date(queryData.events_getOne.start),
      end: new Date(queryData.events_getOne.end),
      regStart: new Date(queryData.events_getOne.registrationStart),
      regEnd: new Date(queryData.events_getOne.registrationEnd),
      place: queryData.events_getOne.place ?? '',
      isClosed: queryData.events_getOne.isClosedEvent ?? true,
      capacity: `${queryData.events_getOne.capacity || ''}`,
      reglink: queryData.events_getOne.uniqueName ?? '',
      application: queryData.events_getOne.registrationAllowed ?? true,
      organizers: resultOrganizers,
      chiefOrganizers: resultChiefOrganizers,
      hostingClubs: resultOrganizerClubs,
    });
  });

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

  const [
    getOwnClubs,
    {
      called: getOwnClubsCalled,
      loading: getOwnClubsLoading,
      error: getOwnClubsError,
    },
  ] = useProfileGetSelfQueryLazy((queryData) => {
    setOwnClubs(
      queryData.users_getSelf.clubMemberships.nodes.map((c) => {
        return { id: c.club.id, name: c.club.name } as Club;
      }),
    );
    setManagedClubs(
      queryData.users_getSelf.clubMemberships.nodes
        .filter((c) => c.role === ClubRole[ClubRole.CLUB_MANAGER])
        .map((c) => {
          return { id: c.club.id, name: c.club.name } as Club;
        }),
    );
  });

  const [
    getCurrentEvent,
    {
      called: getCurrentEventCalled,
      loading: getCurrentEventLoading,
      error: getCurrentEventError,
      data: getCurrentEventData,
    },
  ] = useEventGetInformationQuery((queryData) => {
    getOrganizers({ variables: { id: queryData.events_getOne.id } });
    getClubs();
    getOwnClubs();
    getUniquenames();
    setAccessCMAdmin(
      isClubManagerOf(queryData.events_getOne.hostingClubs) || isAdmin(),
    );
    setOriginalUniqueName(queryData.events_getOne.uniqueName);
  });

  const client = useApolloClient();
  const [
    getEventTokenMutationID,
    { error: eventTokenMutationErrorID },
  ] = useEventTokenMutationID(client, () => {
    getOrganizers({ variables: { id: event.id } });
    getClubs();
    getOwnClubs();
    getUniquenames();
    setAccessCMAdmin(isClubManagerOf(event.hostingClubs) || isAdmin());
    setOriginalUniqueName(event.uniqueName);
  });
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
  });

  const makeToast = useToastService();

  const [getEventInformationMutation] = useEventInformationMutation({
    onCompleted: () => {
      makeToast('Sikeres szerkesztés');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });

  useEffect(() => {
    if (event) getEventTokenMutationID(event.id);
    else if (uniqueName) getEventTokenMutationUN(uniqueName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    (getOrganizersCalled && getOrganizersLoading) ||
    (getClubsCalled && getClubsLoading) ||
    (getOwnClubsCalled && getOwnClubsLoading) ||
    (getCurrentEventCalled && getCurrentEventLoading) ||
    (getUniquenamesCalled && getUniquenamesLoading) ||
    !initialValues
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationErrorID ||
    eventTokenMutationErrorUN ||
    getOrganizersError ||
    getCurrentEventError ||
    getClubsError ||
    getOwnClubsError ||
    getUniquenamesError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <div>Error</div>;
  }

  const handleSubmit = (values: EventTabProps): void => {
    getEventInformationMutation(
      event?.id ?? getCurrentEventData?.events_getOne.id,
      values.name,
      values.description,
      values.start.toISOString(),
      values.end.toISOString(),
      values.regStart.toISOString(),
      values.regEnd.toISOString(),
      values.place,
      values.organizers.map((o) => o.id),
      values.chiefOrganizers.map((o) => o.id),
      accessCMAdmin ? values.isClosed : undefined,
      parseInt(values.capacity, 10) || 0,
      values.reglink,
      values.application,
      accessCMAdmin ? values.hostingClubs.map((c) => c.id) : undefined,
    );
  };

  return (
    <Layout>
      <EventTabs
        accessCMAdmin={accessCMAdmin}
        uniqueNames={uniqueNames}
        originalUniqueName={originalUniqueName}
        allClubs={allClubs}
        showedClubs={
          accessCMAdmin
            ? allClubs
            : allClubs.filter((c) => ownClubs.map((o) => o.id).includes(c.id))
        }
        managedClubs={managedClubs}
        handleSubmit={handleSubmit}
        withApplication
        initialValues={initialValues}
      />
    </Layout>
  );
}
DetailsPage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
