import 'react-quill/dist/quill.snow.css';

import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
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
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { Club, EventTabProps, User } from '../../interfaces';
import {
  getCapacityValid,
  getChiefOrganizersValid,
  getEndValid,
  getHostingClubsValid,
  getNameValid,
  getPlaceValid,
  getRegEndValid,
  getReglinkValid,
  getRegStartValid,
  getStartValid,
} from '../../utils/services/EventFormValidation';
import useToastService from '../../utils/services/ToastService';
import Button from '../control/Button';
import Multiselectpopup from '../control/Multiselectpopup';
import ClubselectorModal from '../userselector/ClubSelectorModal';
import UserSelectorModal from '../userselector/UserSelectorModal';
import Calendar, { roundTime } from '../util/Calendar';
import Label from '../util/Label';

const ReactQuill =
  typeof window === 'object' ? require('react-quill') : (): boolean => false;

interface Props {
  accessCMAdmin?: boolean;
  uniqueNames: string[];
  originalUniqueName?: string;
  allClubs: Club[];
  showedClubs: Club[];
  managedClubs: Club[];
  handleSubmit: (values: EventTabProps) => void;
  withApplication: boolean;
  initialValues: EventTabProps;
}

export default function EventTabs({
  accessCMAdmin,
  uniqueNames,
  originalUniqueName,
  allClubs,
  showedClubs,
  managedClubs,
  handleSubmit,
  withApplication,
  initialValues,
}: Props): JSX.Element {
  const [name, setName] = useState(initialValues.name);
  const [isNameValid, setNameValid] = useState<string[]>([]);
  const [description, setDescription] = useState(initialValues.description);
  const [start, setStart] = useState(initialValues.start);
  const [isStartValid, setStartValid] = useState<string[]>([]);
  const [end, setEnd] = useState(initialValues.end);
  const [isEndValid, setEndValid] = useState<string[]>([]);
  const [regStart, setRegStart] = useState(initialValues.regStart);
  const [isRegStartValid, setRegStartValid] = useState<string[]>([]);
  const [regEnd, setRegEnd] = useState(initialValues.regEnd);
  const [isRegEndValid, setRegEndValid] = useState<string[]>([]);
  const [place, setPlace] = useState(initialValues.place);
  const [isPlaceValid, setPlaceValid] = useState<string[]>([]);
  const [isClosed, setIsClosed] = useState(initialValues.isClosed);
  const [capacity, setCapacity] = useState(`${initialValues.capacity}`);
  const [isCapacityValid, setCapacityValid] = useState<string[]>([]);
  const [reglink, setReglink] = useState(initialValues.reglink);
  const [isReglinkValid, setReglinkValid] = useState<string[]>([]);
  const [application, setApplication] = useState(initialValues.application);
  const [organizers, setOrganizers] = useState<User[]>(
    initialValues.organizers,
  );
  const [chiefOrganizers, setChiefOrganizers] = useState<User[]>(
    initialValues.chiefOrganizers,
  );
  const [isChiefOrganizersValid, setChiefOrganizersValid] = useState<string[]>(
    [],
  );
  const [hostingClubs, setHostingClubs] = useState<Club[]>(
    initialValues.hostingClubs,
  );
  const [hostingClubsValid, setHostingClubsValid] = useState<string[]>([]);
  const [autogenUniqueName, setAutogenUniqueName] = useState(
    initialValues.name.length === 0,
  );
  const [tabIndex, setTabIndex] = React.useState(0);

  const makeToast = useToastService();
  const useDisclosureChiefOrganizers = useDisclosure();
  const useDisclosureOrganizers = useDisclosure();
  const useDisclosureClubs = useDisclosure();

  const validTab = (index: number): void => {
    switch (index) {
      case 0:
        setNameValid(getNameValid(name));
        setReglinkValid(
          getReglinkValid(reglink, uniqueNames, originalUniqueName),
        );
        break;
      case 1:
        setStartValid(getStartValid(start));
        setEndValid(getEndValid(end, start));
        setRegStartValid(getRegStartValid(regStart, start));
        setRegEndValid(getRegEndValid(regEnd, regStart, end));
        setPlaceValid(getPlaceValid(place));
        setCapacityValid(getCapacityValid(capacity));
        break;
      case 2:
        setChiefOrganizersValid(getChiefOrganizersValid(chiefOrganizers));
        break;
      case 3:
        setHostingClubsValid(getHostingClubsValid(hostingClubs, managedClubs));
        break;
      default:
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
    setHostingClubs(selectedList);
  };

  const generateUniqueName = (eventName: string): string => {
    return eventName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ /g, '-');
  };

  return (
    <Box>
      <Tabs
        isFitted
        variant="enclosed"
        width="100%"
        index={tabIndex}
        onChange={(tab): void => {
          if (tab !== tabIndex) validTab(tabIndex);
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
            disabled={!accessCMAdmin}
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
                  <Label minHeight={['0', null, '2rem']}>Esemény neve</Label>
                  <Box>
                    <Input
                      name="name"
                      value={name}
                      isInvalid={isNameValid.length > 0}
                      onChange={(e: React.FormEvent): void => {
                        const v = (e.target as HTMLInputElement).value;
                        setName(v);
                        setNameValid(getNameValid(v));
                        if (autogenUniqueName) {
                          const newUniqueName = generateUniqueName(v);
                          setReglink(newUniqueName);
                          setReglinkValid(
                            getReglinkValid(
                              newUniqueName,
                              uniqueNames,
                              originalUniqueName,
                            ),
                          );
                        }
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
                  <Label minHeight={['0', null, '2rem']}>
                    <Box>Esemény meghivó linkje</Box>
                    <Box fontStyle="italic" fontSize="0.75rem">
                      Ez fog megjelenni az esemény URL-jében.
                    </Box>
                  </Label>
                  <Box>
                    <Input
                      name="reglink"
                      value={reglink}
                      isInvalid={isReglinkValid.length > 0}
                      onChange={(e: React.FormEvent): void => {
                        const v = (e.target as HTMLInputElement).value;
                        setReglink(v);
                        setReglinkValid(
                          getReglinkValid(v, uniqueNames, originalUniqueName),
                        );
                        if (v.length === 0) setAutogenUniqueName(true);
                        else setAutogenUniqueName(false);
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
                  <Label minHeight={['0', null, '2rem']}>Esemény leírása</Label>
                  <Flex gridColumn="1/-1" minHeight="15rem" flexDir="column">
                    <ReactQuill
                      value={description}
                      onChange={setDescription}
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
                    width={['45%', null, '10rem']}
                    text={<ArrowForwardIcon boxSize={6} />}
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
                  <Label minHeight={['0', null, '2rem']}>Esemény kezdete</Label>
                  <Box>
                    <Flex
                      alignItems="center"
                      borderRadius="0.25rem"
                      border="2px solid"
                      borderColor={isStartValid ? 'transparent' : 'red.500'}
                    >
                      <Calendar
                        name="start"
                        selected={start}
                        withIcon
                        onChange={(date: Date): void => {
                          const newDate = roundTime(date, 15);
                          setStart(newDate);
                          setStartValid(getStartValid(newDate));
                        }}
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
                  <Label minHeight={['0', null, '2rem']}>Esemény vége</Label>
                  <Box>
                    <Flex
                      alignItems="center"
                      borderRadius="0.25rem"
                      border="2px solid"
                      borderColor={isEndValid ? 'transparent' : 'red.500'}
                    >
                      <Calendar
                        name="end"
                        selected={end}
                        withIcon
                        onChange={(date: Date): void => {
                          const newDate = roundTime(date, 15);
                          setEnd(newDate);
                          setEndValid(getEndValid(newDate, start));
                        }}
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
                  <Label minHeight={['0', null, '2rem']}>
                    Regisztráció kezdete
                  </Label>
                  <Box>
                    <Flex
                      alignItems="center"
                      borderRadius="0.25rem"
                      border="2px solid"
                      borderColor={isRegStartValid ? 'transparent' : 'red.500'}
                    >
                      <Calendar
                        name="regStart"
                        selected={regStart}
                        withIcon
                        onChange={(date: Date): void => {
                          const newDate = roundTime(date, 15);
                          setRegStart(newDate);
                          setRegStartValid(getRegStartValid(newDate, start));
                        }}
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
                  <Label minHeight={['0', null, '2rem']}>
                    Regisztráció vége
                  </Label>
                  <Box>
                    <Flex
                      alignItems="center"
                      borderRadius="0.25rem"
                      border="2px solid"
                      borderColor={isRegEndValid ? 'transparent' : 'red.500'}
                    >
                      <Calendar
                        name="regEnd"
                        selected={regEnd}
                        withIcon
                        onChange={(date: Date): void => {
                          const newDate = roundTime(date, 15);
                          setRegEnd(newDate);
                          setRegEndValid(
                            getRegEndValid(newDate, regStart, end),
                          );
                        }}
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
                  <Label minHeight={['0', null, '2rem']}>
                    Esemény helyszíne
                  </Label>
                  <Box>
                    <Input
                      name="place"
                      value={place}
                      isInvalid={isPlaceValid.length > 0}
                      onChange={(e: React.FormEvent): void => {
                        const v = (e.target as HTMLInputElement).value;
                        setPlace(v);
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
                  <Label minHeight={['0', null, '2rem']}>
                    <Box>Esemény létszám korlátja</Box>
                    <Box fontStyle="italic" fontSize="0.75rem">
                      Maximálisan hány fő regisztrálhat. Hagyd üresen, ha
                      korlátlan eseményt szeretnél.
                    </Box>
                  </Label>
                  <Box>
                    <Input
                      name="capacity"
                      type="number"
                      placeholder="Korlátlan"
                      value={capacity}
                      isInvalid={isCapacityValid.length > 0}
                      onChange={(e: React.FormEvent): void => {
                        setCapacity((e.target as HTMLInputElement).value);
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
                  {withApplication && (
                    <>
                      <Label minHeight={['0', null, '2rem']}>
                        <Box>Jelentkezés letiltva</Box>
                        <Box fontStyle="italic" fontSize="0.75rem">
                          A regisztrációs időszak ellenére le van-e tiltva a
                          jelentkezés.
                        </Box>
                      </Label>
                      <Select
                        name="application"
                        value={application ? 'Nem' : 'Igen'}
                        onChange={(e: React.FormEvent): void => {
                          setApplication(
                            (e.target as HTMLInputElement).value === 'Nem',
                          );
                        }}
                      >
                        <option value="Igen">Igen</option>
                        <option value="Nem">Nem</option>
                      </Select>
                    </>
                  )}
                </Grid>
                <Flex
                  justifyContent="space-between"
                  flexDir="row"
                  mt={4}
                  width="100%"
                >
                  <Button
                    width={['45%', null, '10rem']}
                    text={<ArrowBackIcon boxSize={6} />}
                    onClick={(): void => {
                      validTab(tabIndex);
                      setTabIndex(tabIndex - 1);
                    }}
                  />
                  <Button
                    width={['45%', null, '10rem']}
                    text={<ArrowForwardIcon boxSize={6} />}
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
                  <Label minHeight={['0', null, '2rem']}>Fő szervezők</Label>
                  <Flex flexDir="column">
                    <Multiselectpopup
                      value={chiefOrganizers}
                      isInvalid={isChiefOrganizersValid.length > 0}
                      onClick={useDisclosureChiefOrganizers.onOpen}
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
                  </Flex>
                  <Label minHeight={['0', null, '2rem']}>Szervezők</Label>
                  <Multiselectpopup
                    value={organizers}
                    onClick={useDisclosureOrganizers.onOpen}
                    valueProp="id"
                    labelProp="name"
                  />
                </Grid>
                <Flex
                  justifyContent="space-between"
                  flexDir="row"
                  mt={4}
                  width="100%"
                >
                  <Button
                    width={['45%', null, '10rem']}
                    text={<ArrowBackIcon boxSize={6} />}
                    onClick={(): void => {
                      validTab(tabIndex);
                      setTabIndex(tabIndex - 1);
                    }}
                  />
                  <Button
                    width={['45%', null, '10rem']}
                    text={<ArrowForwardIcon boxSize={6} />}
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
                  <Label minHeight={['0', null, '2rem']}>Szervező körök</Label>
                  <Flex flexDir="column">
                    <Multiselectpopup
                      value={hostingClubs}
                      isInvalid={hostingClubsValid.length > 0}
                      onClick={useDisclosureClubs.onOpen}
                      valueProp="id"
                      labelProp="name"
                    />
                    <Box>
                      {hostingClubsValid.map((t) => (
                        <Text key={t} color="red.500">
                          {t}
                        </Text>
                      ))}
                    </Box>
                  </Flex>
                  <Label minHeight={['0', null, '2rem']}>
                    <Box>Esemény látogathatósága</Box>
                    <Box fontStyle="italic" fontSize="0.75rem">
                      Nyílt: publikus esemény
                      <br />
                      Zárt: csak a szervező körök tagjai érhetik el
                    </Box>
                  </Label>
                  <Select
                    name="isClosed"
                    value={isClosed ? 'Zárt' : 'Nyílt'}
                    onChange={(e: React.FormEvent): void => {
                      setIsClosed(
                        (e.target as HTMLInputElement).value === 'Zárt',
                      );
                    }}
                  >
                    <option value="Zárt">Zárt</option>
                    <option value="Nyílt">Nyílt</option>
                  </Select>
                </Grid>
                <Flex justifyContent="flex-start" mt={4}>
                  <Button
                    width={['45%', null, '10rem']}
                    text={<ArrowBackIcon boxSize={6} />}
                    onClick={(): void => {
                      validTab(tabIndex);
                      setTabIndex(tabIndex - 1);
                    }}
                  />
                </Flex>
              </Box>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Flex justify="center" p={4}>
        <Flex width="80%" justify="flex-end">
          <Button
            width={['100%', null, '45%']}
            text="Mentés"
            onClick={(): void => {
              for (let i = 0; i < 4; i += 1) {
                validTab(i);
              }
              const allErrors = [
                ...isNameValid,
                ...isReglinkValid,
                ...isStartValid,
                ...isEndValid,
                ...isRegStartValid,
                ...isRegEndValid,
                ...isPlaceValid,
                ...isCapacityValid,
                ...isChiefOrganizersValid,
                ...hostingClubsValid,
              ];
              if (allErrors.length === 0) {
                handleSubmit({
                  name,
                  description,
                  start,
                  end,
                  regStart,
                  regEnd,
                  place,
                  organizers,
                  chiefOrganizers,
                  isClosed,
                  capacity,
                  reglink,
                  application,
                  hostingClubs,
                });
              } else {
                makeToast('Hibás adatok', true, allErrors.join('\n'));
              }
            }}
          />
        </Flex>
      </Flex>
      <UserSelectorModal
        clubs={showedClubs}
        useDisclosureProps={useDisclosureChiefOrganizers}
        title="Fő szervezők"
        users={chiefOrganizers}
        setUsers={(values: User[], newValue?: User): void => {
          onChangeChiefOrganizers(values, newValue);
          setChiefOrganizersValid(getChiefOrganizersValid(values));
        }}
      />
      <UserSelectorModal
        clubs={showedClubs}
        useDisclosureProps={useDisclosureOrganizers}
        title="Szervezők"
        users={organizers}
        setUsers={(values: User[], newValue?: User): void => {
          onChangeOrganizers(values, newValue);
        }}
      />
      <ClubselectorModal
        useDisclosureProps={useDisclosureClubs}
        title="Szervező körök"
        allClubs={allClubs}
        selectedClubs={hostingClubs}
        setClubs={(values: Club[]): void => {
          onChangeClubs(values);
          setHostingClubsValid(getHostingClubsValid(values, managedClubs));
        }}
      />
    </Box>
  );
}
EventTabs.defaultProps = {
  accessCMAdmin: true,
  originalUniqueName: '',
};
