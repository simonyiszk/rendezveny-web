import { useApolloClient } from '@apollo/client';
import { useToast } from '@chakra-ui/core';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { Layout } from '../../components/Layout';
import Loading from '../../components/Loading';
import MemberSection from '../../components/MemberSection';
import { Event, EventRelation } from '../../interfaces';
import { useEventGetMembersQuery } from '../../utils/api/registration/EventMembersQuery';
import { useSetAttendMutation } from '../../utils/api/registration/RegistrationMutation';
import { useEventTokenMutation } from '../../utils/api/token/EventsGetTokenMutation';

interface PageState {
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

export default function MembersPage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state);
  const { event } = state;

  const [registeredUsers, setRegisteredUsers] = useState<EventRelation[]>([]);

  const [
    getEventRegs,
    {
      called: getEventCalled,
      loading: getEventLoading,
      error: getEventError,
      data: getEventData,
    },
  ] = useEventGetMembersQuery((queryData) => {
    setRegisteredUsers(queryData.events_getOne.relations.nodes);
  });

  const client = useApolloClient();
  const [
    getEventTokenMutation,
    { error: eventTokenMutationError },
  ] = useEventTokenMutation(client, () => {
    getEventRegs({ variables: { id: event.id } });
  });

  const toast = useToast();
  const makeToast = (
    title: string,
    isError = false,
    description = '',
  ): void => {
    toast({
      title,
      description,
      status: isError ? 'error' : 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const [getSetAttendMutation] = useSetAttendMutation({
    onCompleted: () => {
      makeToast('Sikeres belépés');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });

  useEffect(() => {
    if (event) getEventTokenMutation(event.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  if (getEventCalled && getEventLoading) {
    return <Loading />;
  }

  if (!event || eventTokenMutationError || getEventError) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <div>Error</div>;
  }

  const handleSetAttend = (user: EventRelation): void => {
    getSetAttendMutation(user.registration.id, !user.registration.didAttend);
    setRegisteredUsers(
      registeredUsers.map((u) => {
        if (u.userId !== user.userId) return u;
        const newUser = {
          ...u,
          registration: {
            ...u.registration,
            didAttend: !u.registration.didAttend,
          },
        };
        return newUser;
      }),
    );
  };

  return (
    <Layout>
      <MemberSection
        text="Résztvevők"
        listOfMembers={registeredUsers}
        eventL={
          {
            ...event,
            registrationForm: getEventData?.events_getOne.registrationForm,
          } as Event
        }
        setAttendCb={handleSetAttend}
      />
    </Layout>
  );
}
