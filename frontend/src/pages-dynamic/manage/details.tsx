import 'react-datepicker/dist/react-datepicker.css';
import 'react-quill/dist/quill.snow.css';

import { useApolloClient } from '@apollo/client';
import {
  Box,
  Flex,
  Grid,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/core';
import { RouteComponentProps } from '@reach/router';
import { getYear } from 'date-fns';
import hu from 'date-fns/locale/hu';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import ReactQuill from 'react-quill';

import Button from '../../components/Button';
import { Layout } from '../../components/Layout';
import Loading from '../../components/Loading';
import Multiselect from '../../components/Multiselect';
import { Club, Event, User } from '../../interfaces';
import { useClubsGetAllQuery } from '../../utils/api/details/ClubsGetAllQuery';
import { useEventGetOrganizersQuery } from '../../utils/api/details/EventGetOrganizersQuery';
import { useEventInformationMutation } from '../../utils/api/details/EventInformationMutation';
import { useEventGetInformationQuery } from '../../utils/api/index/EventsGetInformation';
import { useEventGetUniquenamesQuery } from '../../utils/api/index/EventsGetUniquenamesQuery';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../utils/api/token/EventsGetTokenMutation';
import {
  getCapacityValid,
  getChiefOrganizersValid,
  getEndValid,
  getNameValid,
  getOrganizerClubsValid,
  getPlaceValid,
  getRegEndValid,
  getReglinkValid,
  getRegStartValid,
  getStartValid,
} from '../../utils/services/EventFormValidation';

registerLocale('hu', hu);

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location: PageProps<null, null, PageState>['location'];
  uniqueName: string;
}

export default function DetailsPage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

  const [organizers, setOrganizers] = useState<User[]>([]);
  const [chiefOrganizers, setChiefOrganizers] = useState<User[]>([]);
  const [isChiefOrganizersValid, setChiefOrganizersValid] = useState<string[]>(
    [],
  );
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [eventName, setEventName] = useState(event?.name || '');
  const [isNameValid, setNameValid] = useState<string[]>([]);
  const [eventDesc, setEventDesc] = useState('');
  const [eventStart, setEventStart] = useState(
    event?.start ? new Date(event?.start) : new Date(),
  );
  const [isStartValid, setStartValid] = useState<string[]>([]);
  const [eventEnd, setEventEnd] = useState(
    event?.end ? new Date(event?.end) : new Date(),
  );
  const [isEndValid, setEndValid] = useState<string[]>([]);
  const [eventRegStart, setEventRegStart] = useState(
    event?.registrationStart ? new Date(event?.registrationStart) : new Date(),
  );
  const [isRegStartValid, setRegStartValid] = useState<string[]>([]);
  const [eventRegEnd, setEventRegEnd] = useState(
    event?.registrationEnd ? new Date(event?.registrationEnd) : new Date(),
  );
  const [isRegEndValid, setRegEndValid] = useState<string[]>([]);
  const [eventPlace, setEventPlace] = useState(event?.place || '');
  const [isPlaceValid, setPlaceValid] = useState<string[]>([]);
  const [eventClosed, setEventClosed] = useState(event?.isClosedEvent || false);
  const [eventCapacity, setEventCapacity] = useState(
    `${event?.capacity || ''}`,
  );
  const [isCapacityValid, setCapacityValid] = useState<string[]>([]);
  const [regLink, setRegLink] = useState(event?.uniqueName || '');
  const [isReglinkValid, setReglinkValid] = useState<string[]>([]);
  const [application, setApplication] = useState(
    event?.registrationAllowed || true,
  );
  const [organizerClubs, setOrganizerClubs] = useState<Club[]>([]);
  const [isOrganizerClubsValid, setOrganizerClubsValid] = useState<string[]>(
    [],
  );
  const [uniqueNames, setUniqueNames] = useState<string[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [tabIndex, setTabIndex] = React.useState(0);

  const [
    getOrganizers,
    {
      called: getOrganizersCalled,
      loading: getOrganizersLoading,
      error: getOrganizersError,
    },
  ] = useEventGetOrganizersQuery((queryData) => {
    const resultAllUser = queryData.events_getOne.relations.nodes.map((u) => {
      return {
        id: u.userId,
        name: u.name,
      } as User;
    });
    const resultOrganizers = queryData.events_getOne.organizers.nodes.map(
      (u) => {
        return {
          id: u.userId,
          name: u.name,
        } as User;
      },
    );
    const resultChiefOrganizers = queryData.events_getOne.chiefOrganizers.nodes.map(
      (u) => {
        return {
          id: u.userId,
          name: u.name,
        } as User;
      },
    );
    const resultOrganizerClubs = queryData.events_getOne.hostingClubs.map(
      (c) => {
        return { id: c.id, name: c.name } as Club;
      },
    );
    setEventName(queryData.events_getOne.name);
    setEventDesc(queryData.events_getOne.description);
    setEventStart(new Date(queryData.events_getOne.start));
    setEventEnd(new Date(queryData.events_getOne.end));
    setEventRegStart(new Date(queryData.events_getOne.registrationStart));
    setEventRegEnd(new Date(queryData.events_getOne.registrationEnd));
    setEventPlace(queryData.events_getOne.place || '');
    setEventClosed(queryData.events_getOne.isClosedEvent || true);
    setEventCapacity(`${queryData.events_getOne.capacity || ''}`);
    setRegLink(queryData.events_getOne.uniqueName || '');
    setApplication(queryData.events_getOne.registrationAllowed || true);
    setAllUsers(resultAllUser);
    setOrganizers(resultOrganizers);
    setChiefOrganizers(resultChiefOrganizers);
    setOrganizerClubs(resultOrganizerClubs);
  });

  const [
    getUniquenames,
    {
      called: getUniquenamesCalled,
      loading: getUniquenamesLoading,
      error: getUniquenamesError,
    },
  ] = useEventGetUniquenamesQuery((queryData) => {
    setUniqueNames(queryData.events_getAll.nodes.map((e) => e.uniqueName));
  });

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

  const [
    getCurrentEvent,
    {
      called: getCurrentEventCalled,
      loading: getCurrentEventLoading,
      error: getCurrentEventError,
      data: getCurrentEventData,
    },
  ] = useEventGetInformationQuery((queryData) => {
    getOrganizers({ variables: { id: queryData.events_getOne.id } });
    getClubs();
    getUniquenames();
  });

  const client = useApolloClient();
  const [
    getEventTokenMutationID,
    { error: eventTokenMutationErrorID },
  ] = useEventTokenMutationID(client, () => {
    getOrganizers({ variables: { id: event.id } });
    getClubs();
  });
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
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

  useEffect(() => {
    if (event) getEventTokenMutationID(event.id);
    else if (uniqueName) getEventTokenMutationUN(uniqueName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    (getOrganizersCalled && getOrganizersLoading) ||
    (getClubsCalled && getClubsLoading) ||
    (getCurrentEventCalled && getCurrentEventLoading) ||
    (getUniquenamesCalled && getUniquenamesLoading)
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationErrorID ||
    eventTokenMutationErrorUN ||
    getOrganizersError ||
    getCurrentEventError ||
    getClubsError ||
    getUniquenamesError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <div>Error</div>;
  }

  const validTab = (index: number): void => {
    switch (index) {
      case 0:
        setNameValid(getNameValid(eventName));
        setReglinkValid(getReglinkValid(regLink, uniqueNames));
        break;
      case 1:
        setStartValid(getStartValid(eventStart));
        setEndValid(getEndValid(eventEnd, eventStart));
        setRegStartValid(getRegStartValid(eventRegStart, eventStart));
        setRegEndValid(getRegEndValid(eventRegEnd, eventRegStart));
        setPlaceValid(getPlaceValid(eventPlace));
        setCapacityValid(getCapacityValid(eventCapacity));
        break;
      case 2:
        setChiefOrganizersValid(getChiefOrganizersValid(chiefOrganizers));
        break;
      case 3:
        setOrganizerClubsValid(getOrganizerClubsValid(organizerClubs));
        break;
      default:
    }
  };

  const handleSubmit = (): void => {
    for (let i = 0; i < 4; i += 1) {
      validTab(i);
    }
    if (
      isNameValid.length === 0 &&
      isReglinkValid.length === 0 &&
      isStartValid.length === 0 &&
      isEndValid.length === 0 &&
      isRegStartValid.length === 0 &&
      isRegEndValid.length === 0 &&
      isPlaceValid.length === 0 &&
      isCapacityValid.length === 0 &&
      isChiefOrganizersValid.length === 0 &&
      isOrganizerClubsValid.length === 0
    ) {
      getEventInformationMutation(
        event?.id ?? getCurrentEventData?.events_getOne.id,
        eventName,
        eventDesc,
        eventStart.toISOString(),
        eventEnd.toISOString(),
        eventRegStart.toISOString(),
        eventRegEnd.toISOString(),
        eventPlace,
        organizers.concat(chiefOrganizers).map((o) => o.id),
        chiefOrganizers.map((o) => o.id),
        eventClosed,
        parseInt(eventCapacity, 10) || 0,
        regLink,
        application,
        organizerClubs.map((c) => c.id),
      );
    } else {
      makeToast('Hibás adatok', true);
    }
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
      <Tabs
        isFitted
        variant="enclosed"
        width="100%"
        index={tabIndex}
        onChange={(tab): void => {
          validTab(tabIndex);
          setTabIndex(tab);
        }}
      >
        <TabList mb="1em">
          <Tab
            _focus={{ boxShadow: 'none' }}
            _selected={{ fontWeight: 'bold', bg: 'simonyi' }}
          >
            Alap adatok
          </Tab>
          <Tab
            _focus={{ boxShadow: 'none' }}
            _selected={{ fontWeight: 'bold', bg: 'simonyi' }}
          >
            Időpont, helyszín
          </Tab>
          <Tab
            _focus={{ boxShadow: 'none' }}
            _selected={{ fontWeight: 'bold', bg: 'simonyi' }}
          >
            Szervezők
          </Tab>
          <Tab
            _focus={{ boxShadow: 'none' }}
            _selected={{ fontWeight: 'bold', bg: 'simonyi' }}
          >
            Szervező körök
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex flexDir="column" alignItems="center">
              <Box as="form" width="80%">
                <Grid
                  gridTemplateColumns={['1fr', null, '1fr 1fr']}
                  rowGap={['0', null, '1rem']}
                >
                  <Label>Esemény neve</Label>
                  <Box>
                    <Input
                      name="eventName"
                      value={eventName}
                      isInvalid={isNameValid.length > 0}
                      onChange={(e: React.FormEvent): void => {
                        const v = (e.target as HTMLInputElement).value;
                        setEventName(v);
                        setNameValid(getNameValid(v));
                      }}
                    />
                    <Box>
                      {isNameValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                  <Label>Esemény meghivó linkje</Label>
                  <Box>
                    <Input
                      name="regLink"
                      value={regLink}
                      isInvalid={isReglinkValid.length > 0}
                      onChange={(e: React.FormEvent): void => {
                        const v = (e.target as HTMLInputElement).value;
                        setRegLink(v);
                        setReglinkValid(getReglinkValid(v, uniqueNames));
                      }}
                    />
                    <Box>
                      {isReglinkValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                  <Label>Esemény leírása</Label>
                  <Flex gridColumn="1/-1" minHeight="15rem" flexDir="column">
                    <ReactQuill
                      value={eventDesc || ''}
                      onChange={(v): void => {
                        setEventDesc(v);
                      }}
                      style={{
                        height: '100%',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    />
                  </Flex>
                </Grid>
                <Flex justifyContent="flex-end" mt={4}>
                  <Button
                    width={['100%', null, '45%']}
                    text="Tovább"
                    onClick={(): void => {
                      validTab(tabIndex);
                      setTabIndex(tabIndex + 1);
                    }}
                  />
                </Flex>
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex flexDir="column" alignItems="center">
              <Box as="form" width="80%">
                <Grid
                  gridTemplateColumns={['1fr', null, '1fr 1fr']}
                  rowGap={['0', null, '1rem']}
                >
                  <Label>Esemény kezdete</Label>
                  <Box>
                    <Flex
                      alignItems="center"
                      px={4}
                      borderRadius="0.25rem"
                      border="2px solid"
                      borderColor={isStartValid ? 'transparent' : 'red.500'}
                    >
                      <DatePicker
                        name="eventStart"
                        selected={eventStart}
                        onChange={(date: Date): void => {
                          setEventStart(date);
                          setStartValid(getStartValid(date));
                        }}
                        dateFormat="yyyy.MM.dd. HH:mm"
                        locale="hu"
                        showTimeSelect
                        renderCustomHeader={datePickerCustomHeader}
                        timeCaption="Időpont"
                      />
                    </Flex>
                    <Box>
                      {isStartValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                  <Label>Esemény vége</Label>
                  <Box>
                    <Flex
                      alignItems="center"
                      px={4}
                      borderRadius="0.25rem"
                      border="2px solid"
                      borderColor={isEndValid ? 'transparent' : 'red.500'}
                    >
                      <DatePicker
                        name="eventEnd"
                        selected={eventEnd}
                        onChange={(date: Date): void => {
                          setEventEnd(date);
                          setEndValid(getEndValid(date, eventStart));
                        }}
                        dateFormat="yyyy.MM.dd. HH:mm"
                        locale="hu"
                        showTimeSelect
                        renderCustomHeader={datePickerCustomHeader}
                        timeCaption="Időpont"
                      />
                    </Flex>
                    <Box>
                      {isEndValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                  <Label>Regisztráció kezdete</Label>
                  <Box>
                    <Flex
                      alignItems="center"
                      px={4}
                      borderRadius="0.25rem"
                      border="2px solid"
                      borderColor={isRegStartValid ? 'transparent' : 'red.500'}
                    >
                      <DatePicker
                        name="eventRegStart"
                        selected={eventRegStart}
                        onChange={(date: Date): void => {
                          setEventRegStart(date);
                          setRegStartValid(getRegStartValid(date, eventStart));
                        }}
                        dateFormat="yyyy.MM.dd. HH:mm"
                        locale="hu"
                        showTimeSelect
                        renderCustomHeader={datePickerCustomHeader}
                        timeCaption="Időpont"
                      />
                    </Flex>
                    <Box>
                      {isRegStartValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                  <Label>Regisztráció vége</Label>
                  <Box>
                    <Flex
                      alignItems="center"
                      px={4}
                      borderRadius="0.25rem"
                      border="2px solid"
                      borderColor={isRegEndValid ? 'transparent' : 'red.500'}
                    >
                      <DatePicker
                        name="eventRegEnd"
                        selected={eventRegEnd}
                        onChange={(date: Date): void => {
                          setEventRegEnd(date);
                          setRegEndValid(getRegEndValid(date, eventRegStart));
                        }}
                        dateFormat="yyyy.MM.dd. HH:mm"
                        locale="hu"
                        showTimeSelect
                        renderCustomHeader={datePickerCustomHeader}
                        timeCaption="Időpont"
                      />
                    </Flex>
                    <Box>
                      {isRegEndValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                  <Label>Esemény helyszíne</Label>
                  <Box>
                    <Input
                      name="eventPlace"
                      value={eventPlace}
                      isInvalid={isPlaceValid.length > 0}
                      onChange={(e: React.FormEvent): void => {
                        const v = (e.target as HTMLInputElement).value;
                        setEventPlace(v);
                        setPlaceValid(getPlaceValid(v));
                      }}
                    />
                    <Box>
                      {isPlaceValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                  <Label>Esemény létszám korlátja</Label>
                  <Box>
                    <Input
                      name="capacity"
                      type="number"
                      placeholder="Korlátlan"
                      value={eventCapacity}
                      isInvalid={isCapacityValid.length > 0}
                      onChange={(e: React.FormEvent): void => {
                        setEventCapacity((e.target as HTMLInputElement).value);
                        setCapacityValid(
                          getCapacityValid(
                            (e.target as HTMLInputElement).value,
                          ),
                        );
                      }}
                    />
                    <Box>
                      {isCapacityValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                </Grid>
                <Flex
                  justifyContent={['center', null, 'space-between']}
                  flexDir={['column', null, 'row']}
                  mt={4}
                  width="100%"
                >
                  <Button
                    width={['100%', null, '45%']}
                    text="Vissza"
                    onClick={(): void => {
                      validTab(tabIndex);
                      setTabIndex(tabIndex - 1);
                    }}
                  />
                  <Button
                    width={['100%', null, '45%']}
                    text="Tovább"
                    onClick={(): void => {
                      validTab(tabIndex);
                      setTabIndex(tabIndex + 1);
                    }}
                  />
                </Flex>
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex flexDir="column" alignItems="center">
              <Box as="form" width="80%">
                <Grid
                  gridTemplateColumns={['1fr', null, '1fr 1fr']}
                  rowGap={['0', null, '1rem']}
                >
                  <Label>Fő szervezők</Label>
                  <Box>
                    <Multiselect
                      options={allUsers}
                      value={chiefOrganizers}
                      isInvalid={isChiefOrganizersValid.length > 0}
                      onChangeCb={(values: User[], newValue?: User): void => {
                        onChangeChiefOrganizers(values, newValue);
                        setChiefOrganizersValid(
                          getChiefOrganizersValid(values),
                        );
                      }}
                      valueProp="id"
                      labelProp="name"
                    />
                    <Box>
                      {isChiefOrganizersValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
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
                </Grid>
                <Flex
                  justifyContent={['center', null, 'space-between']}
                  flexDir={['column', null, 'row']}
                  mt={4}
                  width="100%"
                >
                  <Button
                    width={['100%', null, '45%']}
                    text="Vissza"
                    onClick={(): void => {
                      validTab(tabIndex);
                      setTabIndex(tabIndex - 1);
                    }}
                  />
                  <Button
                    width={['100%', null, '45%']}
                    text="Tovább"
                    onClick={(): void => {
                      validTab(tabIndex);
                      setTabIndex(tabIndex + 1);
                    }}
                  />
                </Flex>
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex flexDir="column" alignItems="center">
              <Box as="form" width="80%">
                <Grid
                  gridTemplateColumns={['1fr', null, '1fr 1fr']}
                  rowGap={['0', null, '1rem']}
                >
                  <Label>Szerező körök</Label>
                  <Box>
                    <Multiselect
                      options={allClubs}
                      value={organizerClubs}
                      isInvalid={isOrganizerClubsValid.length > 0}
                      onChangeCb={(values: Club[]): void => {
                        onChangeClubs(values);
                        setOrganizerClubsValid(getOrganizerClubsValid(values));
                      }}
                      valueProp="id"
                      labelProp="name"
                    />
                    <Box>
                      {isOrganizerClubsValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                  <Label>Esemény látogathatósága</Label>
                  <Select
                    name="eventClosed"
                    value={eventClosed ? 'Zárt' : 'Nyílt'}
                    onChange={(e: React.FormEvent): void => {
                      setEventClosed(
                        (e.target as HTMLInputElement).value === 'Zárt',
                      );
                    }}
                  >
                    <option value="Zárt">Zárt</option>
                    <option value="Nyílt">Nyílt</option>
                  </Select>
                </Grid>
                <Flex
                  justifyContent={['center', null, 'space-between']}
                  flexDir={['column', null, 'row']}
                  mt={4}
                  width="100%"
                >
                  <Button
                    width={['100%', null, '45%']}
                    text="Vissza"
                    onClick={(): void => {
                      validTab(tabIndex);
                      setTabIndex(tabIndex - 1);
                    }}
                  />
                  <Button
                    width={['100%', null, '45%']}
                    text="Mentés"
                    onClick={handleSubmit}
                  />
                </Flex>
              </Box>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
}
