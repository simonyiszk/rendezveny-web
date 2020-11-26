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
import { Event, User } from '../../interfaces';
import { useEventDetailsMutation } from '../../utils/api/details/EventDetailsMutation';
import { useEventGetDetailsQuery } from '../../utils/api/details/EventGetDetailsQuery';
import { useEventTokenMutation } from '../../utils/api/token/EventsGetTokenMutation';
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
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [chiefOrganizers, setChiefOrganizers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [reglink, setReglink] = useState(event?.uniqueName || '');
  const [application, setApplication] = useState(
    event?.registrationAllowed || true,
  );

  const client = useApolloClient();
  const [getEventTokenMutation, _] = useEventTokenMutation(client);
  const [
    getEventDetailsMutation,
    _eventMutationResult,
  ] = useEventDetailsMutation();

  const [getOrganizers, { error }] = useEventGetDetailsQuery((queryData) => {
    const resultAllUser = queryData.events_getOne.relations.nodes.reduce(
      (acc, curr) => {
        return [...acc, { id: curr.userId, name: curr.name } as User];
      },
      [] as User[],
    );
    const resultOrganizers = queryData.events_getOne.organizers.nodes.reduce(
      (acc, curr) => {
        return [...acc, { id: curr.userId, name: curr.name } as User];
      },
      [] as User[],
    );
    const resultChiefOrganizers = queryData.events_getOne.chiefOrganizers.nodes.reduce(
      (acc, curr) => {
        return [...acc, { id: curr.userId, name: curr.name } as User];
      },
      [] as User[],
    );
    setAllUsers(resultAllUser);
    setOrganizers(resultOrganizers);
    setChiefOrganizers(resultChiefOrganizers);
    setReglink(queryData.events_getOne.uniqueName || '');
    setApplication(queryData.events_getOne.registrationAllowed || true);
  });
  useEffect(() => {
    const fetchEventData = async () => {
      await getEventTokenMutation(event.id);
      getOrganizers({ variables: { id: event.id } });
    };
    fetchEventData();
  }, [event.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    getEventDetailsMutation(
      event.id,
      organizers.map((o) => o.id),
      chiefOrganizers.map((o) => o.id),
      reglink,
      application,
    );
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
