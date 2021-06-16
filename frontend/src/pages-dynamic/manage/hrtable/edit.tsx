import { CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  Grid,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';
import BeforeUnloadComponent from 'react-beforeunload-component';
import { useMutation } from 'urql';

import {
  createHRTableMutation,
  modifyHRTableMutation,
} from '../../../api/hrtable/HRModifyTableMutation';
import Backtext from '../../../components/control/Backtext';
import Button from '../../../components/control/Button';
import HRTableComp from '../../../components/hrtable/HRTableComp';
import { Layout } from '../../../components/layout/Layout';
import Calendar, {
  ceilTime,
  nextTime,
  roundTime,
} from '../../../components/util/Calendar';
import { Event, HRSegment, HRTable, HRTask } from '../../../interfaces';
import {
  getEndValid,
  getNameValid,
  getStartValid,
} from '../../../utils/services/HRTaskValidation';
import useToastService from '../../../utils/services/ToastService';

interface PageState {
  event: Event;
  hrTable: HRTable;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
}
interface HRSegmentErrors {
  [key: string]: string[];
}

export default function HRTableEditPage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event, hrTable } = state as PageState;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newId, setNewId] = useState(0);
  const [newTask, setNewTask] = useState<HRTask>();
  const [isNameValid, setNameValid] = useState<string[]>([]);
  const [isStartValid, setStartValid] = useState<HRSegmentErrors>({});
  const [isEndValid, setEndValid] = useState<HRSegmentErrors>({});
  const [isModified, setIsModified] = useState(false);

  const [tasks, setTasks] = useState<HRTask[]>(
    (hrTable?.tasks ?? []).map((t) => {
      return {
        ...t,
        segments: t.segments.map((s) => {
          return { ...s, start: new Date(s.start), end: new Date(s.end) };
        }),
      };
    }),
  );
  const makeToast = useToastService();

  const [, getCreateHRTableMutation] = useMutation(createHRTableMutation);
  const [, getModifyHRTableMutation] = useMutation(modifyHRTableMutation);

  useEffect(() => {
    if (event && !hrTable) {
      getCreateHRTableMutation({ id: event.id }).then((res) => {
        if (res.error) {
          makeToast('Hiba', true, res.error.message);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  if (!event || !event.uniqueName) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <Box>Error</Box>;
  }

  const resetValidStates = (): void => {
    setNameValid([]);
    setStartValid({});
    setEndValid({});
  };
  const openModalLoadTask = (task: HRTask): void => {
    resetValidStates();
    setNewTask(task);
    onOpen();
  };
  const openModalNewTask = (): void => {
    resetValidStates();
    setNewTask({
      id: 'pseudo'.concat(newId.toString()),
      name: '',
      segments: [] as HRSegment[],
      isLocked: false,
    } as HRTask);
    setNewId(newId + 1);
    onOpen();
  };

  const setNewTaskName = (v: string): void => {
    setNewTask({ ...newTask, name: v } as HRTask);
  };
  const handleAddNewSegment = (): void => {
    setNewTask({
      ...newTask,
      segments: [
        ...(newTask?.segments ?? []),
        {
          id: 'pseudo'.concat(newId.toString()),
          isRequired: true,
          start: ceilTime(new Date(event.start), 15),
          end: nextTime(ceilTime(new Date(event.start), 15), 15),
          capacity: 1,
          isLocked: false,
          organizers: [],
        } as HRSegment,
      ],
    } as HRTask);
    setNewId(newId + 1);
  };
  const handleDeleteNewSegment = (segmentId: string): void => {
    setNewTask({
      ...newTask,
      segments: newTask?.segments.filter((s) => s.id !== segmentId),
    } as HRTask);
  };
  const getNewSegmentProp = <U extends keyof HRSegment>(
    segmentId: string,
    prop: U,
  ): U => {
    return newTask?.segments.filter((s) => s.id === segmentId)[0][prop];
  };
  const setNewSegmentProp = (
    segmentId: string,
    prop: string,
    value: Date | boolean,
  ): void => {
    setNewTask({
      ...newTask,
      segments: (newTask?.segments ?? []).map((s) => {
        if (s.id !== segmentId) return s;
        return { ...s, [prop]: value };
      }),
    } as HRTask);
  };

  const handleNewTask = (): void => {
    const modifiedTask = {
      id: newTask?.id,
      name: newTask?.name,
      segments: newTask?.segments,
      isLocked: false,
    } as HRTask;

    if (
      isNameValid.length > 0 ||
      Object.values(isStartValid).some((v) => v.length > 0) ||
      Object.values(isEndValid).some((v) => v.length > 0)
    ) {
      makeToast('Hiba', true);
    } else {
      const index = tasks.findIndex((t) => t.id === newTask?.id);
      if (index === -1) {
        setTasks([...tasks, modifiedTask]);
      } else {
        setTasks(
          tasks.map((t) => {
            if (t.id !== newTask?.id) return t;
            return modifiedTask;
          }),
        );
      }
      setIsModified(true);
      onClose();
    }
  };
  const moveUp = (task: HRTask): void => {
    const movedTasks = [...tasks];
    const idx = movedTasks.findIndex((x) => x.id === task.id);
    const tmp = movedTasks[idx];
    movedTasks[idx] = movedTasks[idx - 1];
    movedTasks[idx - 1] = tmp;
    setTasks(movedTasks);
    setIsModified(true);
  };
  const moveDown = (task: HRTask): void => {
    const movedTasks = [...tasks];
    const idx = movedTasks.findIndex((x) => x.id === task.id);
    const tmp = movedTasks[idx];
    movedTasks[idx] = movedTasks[idx + 1];
    movedTasks[idx + 1] = tmp;
    setTasks(movedTasks);
    setIsModified(true);
  };
  const handleDeleteTask = (taskId: string): void => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    setIsModified(true);
    onClose();
  };

  const handleSubmit = async (): Promise<void> => {
    getModifyHRTableMutation({
      id: event.id,
      hrTable: {
        isLocked: hrTable?.isLocked ?? false,
        tasks: tasks.map((t) => {
          return {
            id: t.id.startsWith('pseudo') ? null : t.id,
            name: t.name,
            isLocked: t.isLocked,
            segments: t.segments.map((s) => {
              return {
                id: s.id.startsWith('pseudo') ? null : s.id,
                start: s.start.toISOString(),
                end: s.end.toISOString(),
                isRequired: s.isRequired,
                capacity: s.capacity,
                isLocked: s.isLocked,
              };
            }),
          };
        }),
      },
    }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        makeToast('Sikeres mentés');
        setIsModified(false);
      }
    });
  };

  const Label = ({ children }: { children: string }): JSX.Element => {
    return <Box mt={['1rem', null, 0]}>{children}</Box>;
  };

  return (
    <BeforeUnloadComponent blockRoute={isModified}>
      <Layout>
        <Backtext
          text="Vissza"
          to={`/manage/${event?.uniqueName}/hrtable`}
          state={{ event }}
        />
        <Heading fontSize="3xl" mt={4}>
          HR Tábla szerkesztése
        </Heading>
        <HRTableComp
          hrtasks={tasks}
          hredit={{ hrEdit: openModalLoadTask, moveUp, moveDown }}
          ownSegmentIds={[]}
        />
        <Flex
          justifyContent={['center', null, 'space-between']}
          flexDir={['column', null, 'row']}
          mt={4}
        >
          <Button
            width={['100%', null, '45%']}
            mb={[4, null, 0]}
            text="Új feladat"
            onClick={openModalNewTask}
          />
          <Button
            width={['100%', null, '45%']}
            text="Mentés"
            onClick={handleSubmit}
          />
        </Flex>

        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Feladat szerkesztése</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box as="form" minWidth="50%">
                <Grid
                  gridTemplateColumns={['1fr', null, '1fr 1fr']}
                  rowGap={['0', null, '1rem']}
                >
                  <Box>Név</Box>
                  <Box>
                    <Input
                      mb={['1rem', null, '0']}
                      value={newTask?.name}
                      isInvalid={isNameValid.length > 0}
                      onChange={(e: React.FormEvent): void => {
                        const v = (e.target as HTMLInputElement).value;
                        setNewTaskName(v);
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
                  <Box gridColumn="1 / -1">Idősávok</Box>
                </Grid>
                {(newTask?.segments ?? []).map((s) => (
                  <Grid
                    gridTemplateColumns={['1fr', null, '1fr 1fr']}
                    rowGap={['0', null, '1rem']}
                    mt={['0', null, '1rem']}
                    borderTop="solid 1px black"
                    key={s.id}
                  >
                    <Label>Kezdés</Label>
                    <Box>
                      <Flex
                        alignItems="center"
                        px={4}
                        borderRadius="0.25rem"
                        border="2px solid"
                        borderColor={isStartValid ? 'transparent' : 'red.500'}
                      >
                        <Calendar
                          name="segmentStart"
                          selected={getNewSegmentProp(s.id, 'start')}
                          onChange={(date: Date): void => {
                            const newDate = roundTime(date, 15);
                            setNewSegmentProp(s.id, 'start', newDate);
                            setStartValid({
                              ...isStartValid,
                              [s.id]: getStartValid(newDate),
                            });
                            setEndValid({
                              ...isEndValid,
                              [s.id]: getEndValid(
                                getNewSegmentProp(s.id, 'end'),
                                newDate,
                              ),
                            });
                          }}
                        />
                      </Flex>
                      <Box>
                        {isStartValid[s.id] &&
                          isStartValid[s.id].map((t) => (
                            <Text key={t} color="red.500">
                              {t}
                            </Text>
                          ))}
                      </Box>
                    </Box>
                    <Label>Vége</Label>
                    <Box>
                      <Flex
                        alignItems="center"
                        px={4}
                        borderRadius="0.25rem"
                        border="2px solid"
                        borderColor={isEndValid ? 'transparent' : 'red.500'}
                      >
                        <Calendar
                          name="segmentEnd"
                          selected={getNewSegmentProp(s.id, 'end')}
                          onChange={(date: Date): void => {
                            const newDate = roundTime(date, 15);
                            setNewSegmentProp(s.id, 'end', newDate);
                            setEndValid({
                              ...isEndValid,
                              [s.id]: getEndValid(
                                newDate,
                                getNewSegmentProp(s.id, 'start'),
                              ),
                            });
                          }}
                        />
                      </Flex>
                      <Box>
                        {isEndValid[s.id] &&
                          isEndValid[s.id].map((t) => (
                            <Text key={t} color="red.500">
                              {t}
                            </Text>
                          ))}
                      </Box>
                    </Box>
                    <Label>Kötezelő</Label>
                    <Select
                      name="segmentRequired"
                      value={
                        getNewSegmentProp(s.id, 'isRequired') ? 'Igen' : 'Nem'
                      }
                      onChange={(e: React.FormEvent): void =>
                        setNewSegmentProp(
                          s.id,
                          'isRequired',
                          (e.target as HTMLInputElement).value === 'Igen',
                        )
                      }
                    >
                      <option value="Igen">Igen</option>
                      <option value="Nem">Nem</option>
                    </Select>
                    <Button
                      gridColumn={['1', null, '2']}
                      my={['1rem', null, 0]}
                      width="30%"
                      justifySelf="end"
                      text={<CloseIcon />}
                      onClick={(): void => handleDeleteNewSegment(s.id)}
                      backgroundColor="red.500"
                    />
                  </Grid>
                ))}
              </Box>
            </ModalBody>

            <ModalFooter>
              <Flex width="100%" flexDirection="column">
                <Flex justifyContent="center" width="100%" mb={4}>
                  <Button
                    width={['100%', null, '45%']}
                    text="Új idősáv"
                    onClick={handleAddNewSegment}
                  />
                </Flex>
                <Flex
                  justifyContent={['center', null, 'space-between']}
                  flexDir={['column', null, 'row']}
                  width="100%"
                >
                  <Button
                    width={['100%', null, '45%']}
                    order={[1, null, 0]}
                    text="Törlés"
                    backgroundColor="red.500"
                    mt={[4, null, 0]}
                    onClick={(): void => {
                      handleDeleteTask(newTask?.id);
                    }}
                  />
                  <Button
                    width={['100%', null, '45%']}
                    text="Mentés"
                    onClick={handleNewTask}
                  />
                </Flex>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Layout>
    </BeforeUnloadComponent>
  );
}
HRTableEditPage.defaultProps = {
  location: undefined,
};
