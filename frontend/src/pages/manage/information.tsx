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
import { useEventInformationMutation } from '../../utils/api/EventInformationMutation';
import { useEventGetInformationQuery } from '../../utils/api/information/EventGetInformationQuery';
import { useEventTokenMutation } from '../../utils/api/token/EventsGetTokenMutation';
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
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [chiefOrganizers, setChiefOrganizers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

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
  const [eventClosed, setEventClosed] = useState(event?.isClosedEvent || false);
  const [eventCapacity, setEventCapacity] = useState(event?.capacity || 0);
  const [regLink, setRegLink] = useState(event?.uniqueName || '');

  const client = useApolloClient();
  const [getEventTokenMutation, _] = useEventTokenMutation(client);
  const [
    getEventInformationMutation,
    _eventMutationResult,
  ] = useEventInformationMutation();

  const [getOrganizers, { error }] = useEventGetInformationQuery(
    (queryData) => {
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
      setEventName(queryData.events_getOne.name);
      setEventStart(new Date(queryData.events_getOne.start));
      setEventEnd(new Date(queryData.events_getOne.end));
      setEventRegStart(new Date(queryData.events_getOne.registrationStart));
      setEventRegEnd(new Date(queryData.events_getOne.registrationEnd));
      setEventPlace(queryData.events_getOne.place || '');
      setEventClosed(queryData.events_getOne.isClosedEvent || true);
      setEventCapacity(queryData.events_getOne.capacity || 0);
      setRegLink(queryData.events_getOne.uniqueName || '');
      setAllUsers(resultAllUser);
      setOrganizers(resultOrganizers);
      setChiefOrganizers(resultChiefOrganizers);
    },
  );
  useEffect(() => {
    const fetchEventData = async () => {
      if (event) {
        await getEventTokenMutation(event.id);
        getOrganizers({ variables: { id: event.id } });
      }
    };
    fetchEventData();
  }, [event?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    getEventInformationMutation(
      event.id,
      eventName,
      eventStart.toISOString(),
      eventEnd.toISOString(),
      eventRegStart.toISOString(),
      eventRegEnd.toISOString(),
      eventPlace,
      organizers.concat(chiefOrganizers).map((o) => o.id),
      chiefOrganizers.map((o) => o.id),
      eventClosed,
      eventCapacity,
      regLink,
    );
    /* if (event) {
      navigate('/manage', { state: { event } });
    } else {
      navigate('/');
    } */
  };
  const onChangeOrganizers = (
    selectedList: User[],
    _selectedItem: User,
  ): void => {
    setChiefOrganizers(selectedList);
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
            <Box>Fő szervezők</Box>
            <Multiselect
              name="chiefOrganizers"
              options={allUsers}
              selectedValues={chiefOrganizers}
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
              onChange={(e) => setEventCapacity(parseInt(e.target.value, 10))}
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
