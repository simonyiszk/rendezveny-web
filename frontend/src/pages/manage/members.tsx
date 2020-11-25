import { gql, useApolloClient, useQuery } from '@apollo/client';
import { Box, Flex, Input, Select } from '@chakra-ui/core';
import { tr } from 'date-fns/locale';
import { navigate, PageProps } from 'gatsby';
import { Multiselect } from 'multiselect-react-dropdown';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import MemberSection from '../../components/MemberSection';
import { Event, User } from '../../interfaces';
import { useEventGetMembersQuery } from '../../utils/api/EventMembersQuery';
import { useEventTokenMutation } from '../../utils/api/EventsGetTokenMutation';
import {
  useRegisterDeleteMutation,
  useSetAttendMutation,
} from '../../utils/api/RegistrationMutation';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';

interface PageState {
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

export default function MembersPage({
  location: {
    state: { event },
  },
}: Props): JSX.Element {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  const client = useApolloClient();
  const [getEventTokenMutation, _] = useEventTokenMutation(client);

  const [getSetAttendMutation, _getSetAttendMutation] = useSetAttendMutation();
  const [
    getRegisterDeleteMutation,
    _getRegisterDeleteMutation,
  ] = useRegisterDeleteMutation();

  const [getOrganizers, { error }] = useEventGetMembersQuery((queryData) => {
    const resultRegisteredUsers = queryData.events_getOne.relations.nodes.reduce(
      (acc, curr) => {
        return [
          ...acc,
          {
            id: curr.userId,
            name: curr.name,
            registration: curr.registration,
          } as User,
        ];
      },
      [] as User[],
    );

    setRegisteredUsers(resultRegisteredUsers);
  });
  useEffect(() => {
    const fetchEventData = async () => {
      await getEventTokenMutation(event.id);
      getOrganizers({ variables: { id: event.id } });
    };
    fetchEventData();
  }, [event.id]);

  const handleAttend = (user: User) => {
    getSetAttendMutation(user.registration.id, !user.registration.didAttend);
    setRegisteredUsers(
      registeredUsers.map((u) => {
        if (u.id !== user.id) return u;
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

  const handleDelete = (user: User) => {
    getRegisterDeleteMutation(user.registration.id);
    setRegisteredUsers(registeredUsers.filter((u) => u.id !== user.id));
  };

  return (
    <Layout>
      <MemberSection
        text="Résztvevők"
        listOfMembers={registeredUsers}
        setAttendCb={handleAttend}
        deleteCb={handleDelete}
      />
    </Layout>
  );
}
