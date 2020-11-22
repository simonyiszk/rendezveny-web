import { gql, useApolloClient, useQuery } from '@apollo/client';
import { Box, Flex, Input, Select } from '@chakra-ui/core';
import { navigate, PageProps } from 'gatsby';
import { Multiselect } from 'multiselect-react-dropdown';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import { Event, User } from '../../interfaces';
import { useEventGetDetailsQuery } from '../../utils/api/EventGetDetailsQuery';
import { useEventTokenMutation } from '../../utils/api/EventsGetTokenMutation';
import { useUsersGetAllQuery } from '../../utils/api/UsersGetAllQuery';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';

interface PageState {
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

export default function DetailsPage({
  location: {
    state: { event },
  },
}: Props): JSX.Element {
  const [organizers, setOrganizers] = useState<User[]>([]); // TODO: event.organizers
  const [allUsers, setAllUsers] = useState<User[]>([]); // TODO: make it global
  const [reglink, setReglink] = useState(event?.uniqueName || ''); // TODO: event.reglink
  const [application, setApplication] = useState(
    event?.registrationAllowed || true,
  ); // TODO: event.regopen

  const client = useApolloClient();
  const [getEventTokenMutation, _] = useEventTokenMutation(client);

  const [getUsers, _getuser] = useUsersGetAllQuery((queryData) => {
    setAllUsers(queryData.users_getAll.nodes as User[]);
  });
  const [getOrganizers, { error }] = useEventGetDetailsQuery((queryData) => {
    console.log('QUERYDATA', queryData);
    const result = queryData.events_getOne.relations.nodes
      .filter((curr) => curr.organizer && !curr.organizer.isChiefOrganizer)
      .reduce((acc, curr) => {
        return [...acc, { id: curr.userId, name: curr.name } as User];
      }, [] as User[]);
    setOrganizers(result);
    setReglink(queryData.events_getOne.uniqueName);
    setApplication(queryData.events_getOne.registrationAllowed || true);
  });
  useEffect(() => {
    const fetchEventData = async () => {
      await getEventTokenMutation(event.id);
      getUsers();
      getOrganizers({ variables: { id: event.id } });
    };
    fetchEventData();
  }, [event.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted', organizers, allUsers);
    // navigate('/manage', { state: { event } });
  };
  const onChangeOrganizers = (
    selectedList: User[],
    _selectedItem: User,
  ): void => {
    setOrganizers(selectedList);
  };
  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <form onSubmit={handleSubmit}>
          <Box>
            <Box>Szervezők</Box>
            <Multiselect
              options={allUsers}
              selectedValues={organizers}
              displayValue="name"
              onSelect={onChangeOrganizers}
              onRemove={onChangeOrganizers}
              avoidHighlightFirstOption
              closeIcon="cancel"
            />
          </Box>
          <Box>
            <Box>Regisztrációs link</Box>
            <Input
              name="reglink"
              value={reglink}
              onChange={(e) => setReglink(e.target.value)}
            />
          </Box>
          <Box>
            <Box>Jelentkezés</Box>
            <Select
              name="application"
              value={application ? 'Igen' : 'Nem'}
              onChange={(e) => setApplication(e.target.value === 'Igen')}
            >
              <option value="Igen">Igen</option>
              <option value="Nem">Nem</option>
            </Select>
          </Box>
          <button type="submit">Submit</button>
        </form>
      </Flex>
    </Layout>
  );
}
