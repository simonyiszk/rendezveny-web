import 'react-datepicker/dist/react-datepicker.css';

import { useApolloClient } from '@apollo/client';
import { Box, Flex, Grid, Input, Select, useToast } from '@chakra-ui/core';
import { getYear } from 'date-fns';
import hu from 'date-fns/locale/hu';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import Multiselect, { ActionMeta, ValueType } from 'react-select';

import Button from '../../components/Button';
import { Layout } from '../../components/Layout';
import Loading from '../../components/Loading';
import { Event } from '../../interfaces';
import { useClubsGetAllQuery } from '../../utils/api/details/ClubsGetAllQuery';
import { useClubsGetOtherMembersQuery } from '../../utils/api/details/ClubsGetOtherMembersQuery';
import { useEventGetInformationQuery } from '../../utils/api/details/EventGetInformationQuery';
import {
  useEventCreateMutation,
  useEventDeleteMutation,
  useEventInformationMutation,
} from '../../utils/api/details/EventInformationMutation';
import { useEventTokenMutation } from '../../utils/api/token/EventsGetTokenMutation';

registerLocale('hu', hu);

interface PageState {
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}
interface MultiselectOptions {
  label: string;
  value: string;
}

export default function DetailsPage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

  const [organizers, setOrganizers] = useState<MultiselectOptions[]>([]);
  const [chiefOrganizers, setChiefOrganizers] = useState<MultiselectOptions[]>(
    [],
  );
  const [allUsers, setAllUsers] = useState<MultiselectOptions[]>([]);

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
  const [organizerClubs, setOrganizerClubs] = useState<MultiselectOptions[]>(
    [],
  );
  const [allClubs, setAllClubs] = useState<MultiselectOptions[]>([]);

  const [
    getOrganizers,
    {
      called: getOrganizersCalled,
      loading: getOrganizersLoading,
      error: getOrganizersError,
    },
  ] = useEventGetInformationQuery((queryData) => {
    const resultAllUser = queryData.events_getOne.relations.nodes.map((u) => {
      return { value: u.userId, label: u.name } as MultiselectOptions;
    });
    const resultOrganizers = queryData.events_getOne.organizers.nodes.map(
      (u) => {
        return { value: u.userId, label: u.name } as MultiselectOptions;
      },
    );
    const resultChiefOrganizers = queryData.events_getOne.chiefOrganizers.nodes.map(
      (u) => {
        return { value: u.userId, label: u.name } as MultiselectOptions;
      },
    );
    const resultOrganizerClubs = queryData.events_getOne.hostingClubs.map(
      (c) => {
        return { value: c.id, label: c.name } as MultiselectOptions;
      },
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
    setOrganizerClubs(resultOrganizerClubs);
  });

  const [
    getOtherMembers,
    {
      called: getOtherMembersCalled,
      loading: getOtherMembersLoading,
      error: getOtherMembersError,
    },
  ] = useClubsGetOtherMembersQuery((queryData) => {
    const resultAllUser = queryData.users_getSelf.clubMemberships.nodes
      .reduce((acc, curr) => {
        const resultClubMembers = curr.club.clubMemberships.nodes.map((m) => {
          return {
            value: m.user.id,
            label: m.user.name,
          } as MultiselectOptions;
        });
        return [...acc, ...resultClubMembers];
      }, [] as MultiselectOptions[])
      .filter(
        (user, index, self) =>
          self.findIndex((t) => t.value === user.value) === index,
      );
    setAllUsers(resultAllUser);
  });

  const [
    getClubs,
    { called: getClubsCalled, loading: getClubsLoading, error: getClubsError },
  ] = useClubsGetAllQuery((queryData) => {
    setAllClubs(
      queryData.clubs_getAll.nodes.map((c) => {
        return { value: c.id, label: c.name } as MultiselectOptions;
      }),
    );
  });

  const client = useApolloClient();
  const [
    getEventTokenMutation,
    { error: eventTokenMutationError },
  ] = useEventTokenMutation(client, () => {
    getOrganizers({ variables: { id: event.id } });
    getClubs();
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
  const [getEventInformationMutation] = useEventInformationMutation({
    onCompleted: () => {
      makeToast('Sikeres szerkesztés');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });
  const [getEventCreateMutation] = useEventCreateMutation({
    onCompleted: () => {
      makeToast('Új esemény létrehozva');
      navigate('/manage');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });
  const [getEventDeleteMutation] = useEventDeleteMutation({
    onCompleted: () => {
      makeToast('Sikeres törlés');
      navigate('/manage');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });

  useEffect(() => {
    if (event) {
      getEventTokenMutation(event.id);
    } else {
      getOtherMembers();
      getClubs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  if (
    (getOrganizersCalled && getOrganizersLoading) ||
    (getOtherMembersCalled && getOtherMembersLoading) ||
    (getClubsCalled && getClubsLoading)
  ) {
    return <Loading />;
  }

  if (!event || eventTokenMutationError || getOrganizersError) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <div>Error</div>;
  }
  if (getOtherMembersError || getClubsError) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <div>Error</div>;
  }

  const handleSubmit = (): void => {
    if (event) {
      getEventInformationMutation(
        event.id,
        eventName,
        eventStart.toISOString(),
        eventEnd.toISOString(),
        eventRegStart.toISOString(),
        eventRegEnd.toISOString(),
        eventPlace,
        organizers.concat(chiefOrganizers).map((o) => o.value),
        chiefOrganizers.map((o) => o.value),
        eventClosed,
        eventCapacity,
        regLink,
        application,
        organizerClubs.map((c) => c.value),
      );
    } else {
      getEventCreateMutation(
        eventName,
        eventStart.toISOString(),
        eventEnd.toISOString(),
        eventRegStart.toISOString(),
        eventRegEnd.toISOString(),
        eventPlace,
        chiefOrganizers.map((o) => o.value),
        eventClosed,
        eventCapacity,
        regLink,
        application,
        organizerClubs.map((c) => c.value),
      );
    }
  };
  const handleDelete = (): void => {
    getEventDeleteMutation(event.id);
  };

  const onChangeOrganizers = (
    selectedList: MultiselectOptions[],
    actionMeta: ActionMeta<MultiselectOptions>,
  ): void => {
    if (actionMeta && actionMeta.action === 'select-option')
      setChiefOrganizers(
        chiefOrganizers.filter((o) => o.value !== actionMeta.option?.value),
      );
    setOrganizers(selectedList);
  };
  const onChangeChiefOrganizers = (
    selectedList: MultiselectOptions[],
    actionMeta: ActionMeta<MultiselectOptions>,
  ): void => {
    if (actionMeta.action === 'select-option')
      setOrganizers(
        organizers.filter((o) => o.value !== actionMeta.option?.value),
      );
    setChiefOrganizers(selectedList);
  };

  const onChangeClubs = (selectedList: MultiselectOptions[]): void => {
    setOrganizerClubs(selectedList);
  };

  const datePickerCustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
  }: {
    date: Date;
    decreaseMonth: () => void;
    increaseMonth: () => void;
  }): JSX.Element => (
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
  const Label = ({ children }: { children: string }): JSX.Element => {
    return (
      <Box mt={['1rem', null, 0]} minHeight={['0', null, '2rem']}>
        {children}
      </Box>
    );
  };

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
              onChange={(e: React.FormEvent): void =>
                setEventName((e.target as HTMLInputElement).value)
              }
            />
            <Label>Esemény kezdete</Label>
            <Box>
              <DatePicker
                name="eventStart"
                selected={eventStart}
                onChange={(date: Date): void => {
                  setEventStart(date);
                }}
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
                onChange={(date: Date): void => {
                  setEventEnd(date);
                }}
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
                onChange={(date: Date): void => {
                  setEventRegStart(date);
                }}
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
                onChange={(date: Date): void => {
                  setEventRegEnd(date);
                }}
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
              onChange={(e: React.FormEvent): void =>
                setEventPlace((e.target as HTMLInputElement).value)
              }
            />
            <Label>Fő szervezők</Label>
            <Box maxWidth="20rem">
              <Multiselect
                options={allUsers}
                value={chiefOrganizers}
                isMulti
                onChange={(
                  value: ValueType<MultiselectOptions>,
                  type: ActionMeta<MultiselectOptions>,
                ): void => {
                  onChangeChiefOrganizers(value as MultiselectOptions[], type);
                }}
              />
            </Box>
            <Label>Szervezők</Label>
            <Box maxWidth="20rem">
              <Multiselect
                options={allUsers}
                value={organizers}
                isMulti
                onChange={(
                  value: ValueType<MultiselectOptions>,
                  type: ActionMeta<MultiselectOptions>,
                ): void => {
                  onChangeOrganizers(value as MultiselectOptions[], type);
                }}
              />
            </Box>
            <Label>Esemény látogathatósága</Label>
            <Select
              name="eventClosed"
              value={eventClosed ? 'Zárt' : 'Nyílt'}
              onChange={(e: React.FormEvent): void => {
                setEventClosed((e.target as HTMLInputElement).value === 'Zárt');
              }}
            >
              <option value="Zárt">Zárt</option>
              <option value="Nyílt">Nyílt</option>
            </Select>
            <Label>Esemény létszám korlátja</Label>
            <Input
              name="capacity"
              type="number"
              value={eventCapacity}
              onChange={(e: React.FormEvent): void => {
                setEventCapacity(
                  parseInt((e.target as HTMLInputElement).value, 10),
                );
              }}
            />
            <Label>Esemény meghivó linkje</Label>
            <Input
              name="regLink"
              value={regLink}
              onChange={(e: React.FormEvent): void => {
                setRegLink((e.target as HTMLInputElement).value);
              }}
            />
            <Label>Jelentkezés</Label>
            <Select
              name="application"
              value={application ? 'Igen' : 'Nem'}
              onChange={(e: React.FormEvent): void => {
                setApplication((e.target as HTMLInputElement).value === 'Igen');
              }}
            >
              <option value="Igen">Igen</option>
              <option value="Nem">Nem</option>
            </Select>
            <Label>Szerező körök</Label>
            <Box maxWidth="20rem">
              <Multiselect
                options={allClubs}
                value={organizerClubs}
                isMulti
                onChange={(value: ValueType<MultiselectOptions>): void => {
                  onChangeClubs(value as MultiselectOptions[]);
                }}
              />
            </Box>
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
                backgroundColor="red.500"
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
