import 'react-datepicker/dist/react-datepicker.css';

import { gql, useApolloClient, useQuery } from '@apollo/client';
import { Box, Flex, Grid, Input, Select } from '@chakra-ui/core';
import { getMonth, getYear } from 'date-fns';
import hu from 'date-fns/locale/hu';
import { navigate, PageProps } from 'gatsby';
import { Multiselect } from 'multiselect-react-dropdown';
import React, { useEffect, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import { Club, Event, User } from '../../interfaces';
import { useClubsGetAllQuery } from '../../utils/api/details/ClubsGetAllQuery';
import { useClubsGetOtherMembersQuery } from '../../utils/api/details/ClubsGetOtherMembersQuery';
import { useEventGetInformationQuery } from '../../utils/api/details/EventGetInformationQuery';
import {
  useEventCreateMutation,
  useEventDeleteMutation,
  useEventInformationMutation,
} from '../../utils/api/details/EventInformationMutation';
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

export default function DetailsPage({
  location: {
    state: { event },
  },
}: Props): JSX.Element {
  console.log(event);
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
  const [application, setApplication] = useState(
    event?.registrationAllowed || true,
  );
  const [organizerClubs, setOrganizerClubs] = useState<Club[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);

  const client = useApolloClient();
  const [getEventTokenMutation, _] = useEventTokenMutation(client);
  const [
    getEventInformationMutation,
    _eventMutationResult,
  ] = useEventInformationMutation();
  const [
    getEventCreateMutation,
    _eventMutationResult2,
  ] = useEventCreateMutation();
  const [
    getEventDeleteMutation,
    _eventMutationResult3,
  ] = useEventDeleteMutation();

  const [getOrganizers, { error }] = useEventGetInformationQuery(
    (queryData) => {
      console.log(queryData);
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
      setApplication(queryData.events_getOne.registrationAllowed || true);
      setAllUsers(resultAllUser);
      setOrganizers(resultOrganizers);
      setChiefOrganizers(resultChiefOrganizers);
      setOrganizerClubs(queryData.events_getOne.hostingClubs);
    },
  );
  const [getOtherMembers, _getOtherMembers] = useClubsGetOtherMembersQuery(
    (queryData) => {
      console.log(queryData);
      const resultAllUser = queryData.users_getSelf.clubMemberships.nodes
        .reduce((acc, curr) => {
          const resultClubMembers = curr.club.clubMemberships.nodes.reduce(
            (acc2, curr2) => {
              return [
                ...acc2,
                { id: curr2.user.id, name: curr2.user.name } as User,
              ];
            },
            [] as User[],
          );
          return [...acc, ...resultClubMembers];
        }, [] as User[])
        .filter(
          (user, index, self) =>
            self.findIndex((t) => t.id === user.id) === index,
        );
      console.log(resultAllUser);
      setAllUsers(resultAllUser);
    },
  );

  const [getClubs, _getClubs] = useClubsGetAllQuery((queryData) => {
    console.log(queryData);
    setAllClubs(queryData.clubs_getAll.nodes);
  });

  useEffect(() => {
    const fetchEventData = async () => {
      if (event) {
        await getEventTokenMutation(event.id);
        getOrganizers({ variables: { id: event.id } });
      } else {
        getOtherMembers();
      }
      getClubs();
    };
    fetchEventData();
  }, [event?.id]);

  const handleSubmit = () => {
    if (event) {
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
        application,
        organizerClubs.map((c) => c.id),
      );
    } else {
      getEventCreateMutation(
        eventName,
        eventStart.toISOString(),
        eventEnd.toISOString(),
        eventRegStart.toISOString(),
        eventRegEnd.toISOString(),
        eventPlace,
        chiefOrganizers.map((o) => o.id),
        eventClosed,
        eventCapacity,
        regLink,
        application,
        organizerClubs.map((c) => c.id),
      );
    }
    /* if (event) {
      navigate('/manage', { state: { event } });
    } else {
      navigate('/');
    } */
  };
  const handleDelete = () => {
    getEventDeleteMutation(event.id);
  };
  const onChangeOrganizers = (
    selectedList: User[],
    _selectedItem: User,
  ): void => {
    setChiefOrganizers(
      chiefOrganizers.filter((o) => o.id !== _selectedItem.id),
    );
    setOrganizers(selectedList);
  };
  const onChangeChiefOrganizers = (
    selectedList: User[],
    _selectedItem: User,
  ): void => {
    setOrganizers(organizers.filter((o) => o.id !== _selectedItem.id));
    setChiefOrganizers(selectedList);
  };

  const onChangeClubs = (selectedList: Club[], _selectedItem: Club): void => {
    setOrganizerClubs(selectedList);
  };

  const datePickerCustomHeader = ({ date, decreaseMonth, increaseMonth }) => (
    <Flex
      fontSize="1rem"
      fontWeight="bold"
      justifyContent="space-between"
      px={4}
    >
      <Box cursor="pointer" onClick={decreaseMonth}>
        {'<'}
      </Box>
      <Flex>
        <Box mr={1}>{getYear(date)}.</Box>
        <Box>{date.toLocaleString('default', { month: 'long' })}</Box>
      </Flex>
      <Box cursor="pointer" onClick={increaseMonth}>
        {'>'}
      </Box>
    </Flex>
  );
  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" minWidth="50%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            <Label>Esemény neve</Label>
            <Input
              name="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <Label>Esemény kezdete</Label>
            <Box>
              <DatePicker
                name="eventStart"
                selected={eventStart}
                onChange={(date) => setEventStart(date)}
                dateFormat="yyyy.MM.dd. HH:mm"
                locale="hu"
                showTimeSelect
                renderCustomHeader={datePickerCustomHeader}
                timeCaption="Időpont"
              />
            </Box>
            <Label>Esemény vége</Label>
            <Box>
              <DatePicker
                name="eventEnd"
                selected={eventEnd}
                onChange={(date) => setEventEnd(date)}
                dateFormat="yyyy.MM.dd. HH:mm"
                locale="hu"
                showTimeSelect
                renderCustomHeader={datePickerCustomHeader}
                timeCaption="Időpont"
              />
            </Box>
            <Label>Regisztráció kezdete</Label>
            <Box>
              <DatePicker
                name="eventRegStart"
                selected={eventRegStart}
                onChange={(date) => setEventRegStart(date)}
                dateFormat="yyyy.MM.dd. HH:mm"
                locale="hu"
                showTimeSelect
                renderCustomHeader={datePickerCustomHeader}
                timeCaption="Időpont"
              />
            </Box>
            <Label>Regisztráció vége</Label>
            <Box>
              <DatePicker
                name="eventRegEnd"
                selected={eventRegEnd}
                onChange={(date) => setEventRegEnd(date)}
                dateFormat="yyyy.MM.dd. HH:mm"
                locale="hu"
                showTimeSelect
                renderCustomHeader={datePickerCustomHeader}
                timeCaption="Időpont"
              />
            </Box>
            <Label>Esemény helyszíne</Label>
            <Input
              name="eventPlace"
              value={eventPlace}
              onChange={(e) => setEventPlace(e.target.value)}
            />
            <Label>Fő szervezők</Label>
            <Multiselect
              name="chiefOrganizers"
              options={allUsers}
              selectedValues={chiefOrganizers}
              displayValue="name"
              onSelect={onChangeChiefOrganizers}
              onRemove={onChangeChiefOrganizers}
              avoidHighlightFirstOption
              closeIcon="cancel"
              style={{
                chips: {
                  background: '#6abd51',
                },
              }}
              placeholder=""
            />
            <Label>Szervezők</Label>
            <Multiselect
              name="organizers"
              options={allUsers}
              selectedValues={organizers}
              displayValue="name"
              onSelect={onChangeOrganizers}
              onRemove={onChangeOrganizers}
              avoidHighlightFirstOption
              closeIcon="cancel"
              style={{
                chips: {
                  background: '#6abd51',
                },
              }}
              placeholder=""
            />
            <Label>Esemény látogathatósága</Label>
            <Select
              name="eventClosed"
              value={eventClosed ? 'Zárt' : 'Nyílt'}
              onChange={(e) => setEventClosed(e.target.value === 'Zárt')}
            >
              <option value="Zárt">Zárt</option>
              <option value="Nyílt">Nyílt</option>
            </Select>
            <Label>Esemény létszám korlátja</Label>
            <Input
              name="capacity"
              type="number"
              value={eventCapacity}
              onChange={(e) => setEventCapacity(parseInt(e.target.value, 10))}
            />
            <Label>Esemény meghivó linkje</Label>
            <Input
              name="regLink"
              value={regLink}
              onChange={(e) => setRegLink(e.target.value)}
            />
            <Label>Jelentkezés</Label>
            <Select
              name="application"
              value={application ? 'Igen' : 'Nem'}
              onChange={(e) => setApplication(e.target.value === 'Igen')}
            >
              <option value="Igen">Igen</option>
              <option value="Nem">Nem</option>
            </Select>
            <Label>Szerező körök</Label>
            <Multiselect
              name="organizerClubs"
              options={allClubs}
              selectedValues={organizerClubs}
              displayValue="name"
              onSelect={onChangeClubs}
              onRemove={onChangeClubs}
              avoidHighlightFirstOption
              closeIcon="cancel"
              style={{
                chips: {
                  background: '#6abd51',
                },
              }}
              placeholder=""
            />
          </Grid>
          {!event && (
            <Flex justifyContent="center" mt={4}>
              <Button
                width={['100%', null, '45%']}
                text="Létrehozás"
                onClick={handleSubmit}
              />
            </Flex>
          )}
          {event && (
            <Flex
              justifyContent={['center', null, 'space-between']}
              flexDir={['column', null, 'row']}
              mt={4}
            >
              <Button
                width={['100%', null, '45%']}
                text="Módosítás"
                onClick={handleSubmit}
              />
              <Button
                width={['100%', null, '45%']}
                text="Törlés"
                backgroundColor="red"
                mt={[4, null, 0]}
                onClick={handleDelete}
              />
            </Flex>
          )}
        </Box>
      </Flex>
    </Layout>
  );
}

const Label = ({ children }): JSX.Element => {
  return (
    <Box mt={['1rem', null, 0]} minHeight={['0', null, '2rem']}>
      {children}
    </Box>
  );
};
