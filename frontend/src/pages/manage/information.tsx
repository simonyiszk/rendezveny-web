import 'react-datepicker/dist/react-datepicker.css';

import { gql, useApolloClient, useQuery } from '@apollo/client';
import { Box, Flex, Input, Select } from '@chakra-ui/core';
import hu from 'date-fns/locale/hu';
import { navigate, PageProps } from 'gatsby';
import { Multiselect } from 'multiselect-react-dropdown';
import React, { useEffect, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import { Event, User } from '../../interfaces';
import { useEventGetInformationQuery } from '../../utils/api/EventGetInformationQuery';
import { useEventTokenMutation } from '../../utils/api/EventsGetTokenMutation';
import { useUsersGetAllQuery } from '../../utils/api/UsersGetAllQuery';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';

registerLocale('hu', hu);

interface PageState {
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

export default function InformationPage({
  location: {
    state: { event },
  },
}: Props): JSX.Element {
  const [allUsers, setAllUsers] = useState<User[]>([]); // TODO: make it global

  const [eventName, setEventName] = useState(event?.name || '');
  const [eventStart, setEventStart] = useState(
    event?.start ? new Date(event?.start) : new Date(),
  );
  const [eventEnd, setEventEnd] = useState(
    event?.end ? new Date(event?.end) : new Date(),
  );
  const [eventRegStart, setEventRegStart] = useState(
    event?.registrationStart ? new Date(event?.registrationStart) : new Date(),
  );
  const [eventRegEnd, setEventRegEnd] = useState(
    event?.registrationEnd ? new Date(event?.registrationEnd) : new Date(),
  );
  const [eventPlace, setEventPlace] = useState(event?.place || '');
  const [eventOrganizers, setEventOrganizers] = useState<User[]>([]);
  // const [eventLimit, setEventLimit] = useState(event?.limit || 0);
  const [eventClosed, setEventClosed] = useState(event?.isClosedEvent || false);
  const [eventCapacity, setEventCapacity] = useState(event?.capacity || 0);
  const [regLink, setRegLink] = useState(event?.uniqueName || '');

  const client = useApolloClient();
  const [getEventTokenMutation, _] = useEventTokenMutation(client);

  const [getUsers, _getuser] = useUsersGetAllQuery((queryData) => {
    setAllUsers(queryData.users_getAll.nodes as User[]);
  });
  const [getOrganizers, { error }] = useEventGetInformationQuery(
    (queryData) => {
      const result = queryData.events_getOne.relations.nodes
        .filter((curr) => curr.organizer && curr.organizer.isChiefOrganizer)
        .reduce((acc, curr) => {
          return [...acc, { id: curr.userId, name: curr.name } as User];
        }, [] as User[]);
      setEventRegStart(new Date(queryData.events_getOne.registrationStart));
      setEventRegEnd(new Date(queryData.events_getOne.registrationEnd));
      setRegLink(queryData.events_getOne.uniqueName);
      setEventCapacity(queryData.events_getOne.capacity || 0);
      setEventOrganizers(result);
    },
  );
  useEffect(() => {
    const fetchEventData = async () => {
      getUsers();
      if (event) {
        await getEventTokenMutation(event.id);
        getOrganizers({ variables: { id: event.id } });
      }
    };
    fetchEventData();
  }, [event?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'Submitted',
      eventName,
      eventStart,
      eventEnd,
      eventPlace,
      eventOrganizers,
      eventClosed,
      eventCapacity,
    );
    if (event) {
      navigate('/manage', { state: { event } });
    } else {
      navigate('/');
    }
  };
  const onChangeOrganizers = (
    selectedList: User[],
    _selectedItem: User,
  ): void => {
    setEventOrganizers(selectedList);
  };
  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <form onSubmit={handleSubmit}>
          <Box>
            <Box>Esemény neve</Box>
            <Input
              name="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </Box>
          <Box>
            <Box>Esemény kezdete</Box>
            <DatePicker
              name="eventStart"
              selected={eventStart}
              onChange={(date) => setEventStart(date)}
              dateFormat="yyyy.MM.dd. HH:mm"
              locale="hu"
              showTimeSelect
            />
          </Box>
          <Box>
            <Box>Esemény vége</Box>
            <DatePicker
              name="eventEnd"
              selected={eventEnd}
              onChange={(date) => setEventEnd(date)}
              dateFormat="yyyy.MM.dd. HH:mm"
              locale="hu"
              showTimeSelect
            />
          </Box>
          <Box>
            <Box>Regisztráció kezdete</Box>
            <DatePicker
              name="eventRegStart"
              selected={eventRegStart}
              onChange={(date) => setEventRegStart(date)}
              dateFormat="yyyy.MM.dd. HH:mm"
              locale="hu"
              showTimeSelect
            />
          </Box>
          <Box>
            <Box>Regisztráció vége</Box>
            <DatePicker
              name="eventRegEnd"
              selected={eventRegEnd}
              onChange={(date) => setEventRegEnd(date)}
              dateFormat="yyyy.MM.dd. HH:mm"
              locale="hu"
              showTimeSelect
            />
          </Box>
          <Box>
            <Box>Esemény helyszíne</Box>
            <Input
              name="eventPlace"
              value={eventPlace}
              onChange={(e) => setEventPlace(e.target.value)}
            />
          </Box>
          <Box>
            <Box>Szervezők</Box>
            <Multiselect
              name="eventOrganizers"
              options={allUsers}
              selectedValues={eventOrganizers}
              displayValue="name"
              onSelect={onChangeOrganizers}
              onRemove={onChangeOrganizers}
              avoidHighlightFirstOption
              closeIcon="cancel"
            />
          </Box>
          <Box>
            <Box>Esemény látogathatósága</Box>
            <Select
              name="eventClosed"
              value={eventClosed ? 'Zárt' : 'Nyílt'}
              onChange={(e) => setEventClosed(e.target.value === 'Zárt')}
            >
              <option value="Zárt">Zárt</option>
              <option value="Nyílt">Nyílt</option>
            </Select>
          </Box>
          <Box>
            <Box>Esemény létszám korlátja</Box>
            <Input
              name="capacity"
              type="number"
              value={eventCapacity}
              onChange={(e) => setEventCapacity(e.target.value)}
            />
          </Box>
          <Box>
            <Box>Esemény meghivó linkje</Box>
            <Input
              name="regLink"
              value={regLink}
              onChange={(e) => setRegLink(e.target.value)}
            />
          </Box>
          <button type="submit">{event ? 'Edit' : 'Create'}</button>
        </form>
      </Flex>
    </Layout>
  );
}
