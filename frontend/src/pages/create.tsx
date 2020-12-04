import 'react-datepicker/dist/react-datepicker.css';

import { Box, Flex, Grid, Input, Select, useToast } from '@chakra-ui/core';
import { getYear } from 'date-fns';
import hu from 'date-fns/locale/hu';
import { navigate } from 'gatsby';
import React, { useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import Button from '../components/Button';
import { Layout } from '../components/Layout';
import Loading from '../components/Loading';
import Multiselect from '../components/Multiselect';
import { Club, User } from '../interfaces';
import { useClubsGetAllQuery } from '../utils/api/details/ClubsGetAllQuery';
import { useClubsGetOtherMembersQuery } from '../utils/api/details/ClubsGetOtherMembersQuery';
import { useEventCreateMutation } from '../utils/api/details/EventInformationMutation';

registerLocale('hu', hu);

export default function CreatePage(): JSX.Element {
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [chiefOrganizers, setChiefOrganizers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [eventName, setEventName] = useState('');
  const [eventStart, setEventStart] = useState(new Date());
  const [eventEnd, setEventEnd] = useState(new Date());
  const [eventRegStart, setEventRegStart] = useState(new Date());
  const [eventRegEnd, setEventRegEnd] = useState(new Date());
  const [eventPlace, setEventPlace] = useState('');
  const [eventClosed, setEventClosed] = useState(false);
  const [eventCapacity, setEventCapacity] = useState(0);
  const [regLink, setRegLink] = useState('');
  const [application, setApplication] = useState(true);
  const [organizerClubs, setOrganizerClubs] = useState<Club[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);

  const [
    getClubs,
    { called: getClubsCalled, loading: getClubsLoading, error: getClubsError },
  ] = useClubsGetAllQuery((queryData) => {
    setAllClubs(
      queryData.clubs_getAll.nodes.map((c) => {
        return { id: c.id, name: c.name } as Club;
      }),
    );
  });

  const {
    called: getOtherMembersCalled,
    loading: getOtherMembersLoading,
    error: getOtherMembersError,
  } = useClubsGetOtherMembersQuery((queryData) => {
    const resultAllUser = queryData.users_getSelf.clubMemberships.nodes
      .reduce((acc, curr) => {
        const resultClubMembers = curr.club.clubMemberships.nodes.map((m) => {
          return {
            id: m.user.id,
            name: m.user.name,
          } as User;
        });
        return [...acc, ...resultClubMembers];
      }, [] as User[])
      .filter(
        (user, index, self) =>
          self.findIndex((t) => t.id === user.id) === index,
      );
    setAllUsers(resultAllUser);
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

  if (
    (getOtherMembersCalled && getOtherMembersLoading) ||
    (getClubsCalled && getClubsLoading)
  ) {
    return <Loading />;
  }

  if (getOtherMembersError || getClubsError) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <div>Error</div>;
  }

  const handleSubmit = (): void => {
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
  };

  const onChangeOrganizers = (selectedList: User[], newValue?: User): void => {
    if (newValue)
      setChiefOrganizers(chiefOrganizers.filter((o) => o.id !== newValue.id));
    setOrganizers(selectedList);
  };
  const onChangeChiefOrganizers = (
    selectedList: User[],
    newValue?: User,
  ): void => {
    if (newValue) setOrganizers(organizers.filter((o) => o.id !== newValue.id));
    setChiefOrganizers(selectedList);
  };

  const onChangeClubs = (selectedList: Club[]): void => {
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
            <Multiselect
              options={allUsers}
              value={chiefOrganizers}
              onChangeCb={(values: User[], newValue?: User): void => {
                onChangeChiefOrganizers(values, newValue);
              }}
              valueProp="id"
              labelProp="name"
            />
            <Label>Szervezők</Label>
            <Multiselect
              options={allUsers}
              value={organizers}
              onChangeCb={(values: User[], newValue?: User): void => {
                onChangeOrganizers(values, newValue);
              }}
              valueProp="id"
              labelProp="name"
            />
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
            <Multiselect
              options={allClubs}
              value={organizerClubs}
              onChangeCb={(values: Club[]): void => {
                onChangeClubs(values);
              }}
              valueProp="id"
              labelProp="name"
            />
          </Grid>
          <Flex justifyContent="center" mt={4}>
            <Button
              width={['100%', null, '45%']}
              text="Létrehozás"
              onClick={handleSubmit}
            />
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
}
