import { gql, useQuery } from '@apollo/client';
import { Box, Flex, Input, Select } from '@chakra-ui/core';
import { navigate, PageProps } from 'gatsby';
import { Multiselect } from 'multiselect-react-dropdown';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import { Event, User } from '../../interfaces';
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
  const orgUsers = [
    { id: 1, name: 'April' },
    { id: 2, name: 'May' },
  ] as User[];
  const allUsers = ([
    { id: 3, name: 'June' },
    { id: 4, name: 'July' },
    { id: 5, name: 'August' },
  ] as User[]).concat(orgUsers);
  const eventReglink = 'gala-est';
  const eventRegopen = false;

  const [organizers, setOrganizers] = useState<User[]>(orgUsers); // TODO: event.organizers
  const [reglink, setReglink] = useState(eventReglink); // TODO: event.reglink
  const [application, setApplication] = useState(eventRegopen); // TODO: event.regopen

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted', organizers, reglink, application);
    navigate('/manage', { state: { event } });
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
              selectedValues={orgUsers}
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
