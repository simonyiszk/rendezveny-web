import 'react-datepicker/dist/react-datepicker.css';

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
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { getYear } from 'date-fns';
import hu from 'date-fns/locale/hu';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import {
  useCreateHRTableMutation,
  useModifyHRTableMutation,
} from '../../../api/hrtable/HRModifyTableMutation';
import Button from '../../../components/control/Button';
import LinkButton from '../../../components/control/LinkButton';
import HRTableComp from '../../../components/hrtable/HRTableComp';
import { Layout } from '../../../components/layout/Layout';
import { Event, HRSegment, HRTable, HRTask } from '../../../interfaces';

registerLocale('hu', hu);

interface PageState {
  event: Event;
  hrTable: HRTable;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
}

export default function HRTableNewPage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event, hrTable } = state;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newId, setNewId] = useState(0);
  const [newTask, setNewTask] = useState<HRTask>();

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
  const [getCreateHRTableMutation] = useCreateHRTableMutation({
    onCompleted: () => {},
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });
  const [getModifyHRTableMutation] = useModifyHRTableMutation({
    onCompleted: () => {
      makeToast('Sikeres mentés');
    },
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });

  useEffect(() => {
    if (event && !hrTable) {
      getCreateHRTableMutation(event.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  if (!event || !event.uniqueName) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <Box>Error</Box>;
  }

  const openModalLoadTask = (task: HRTask): void => {
    setNewTask(task);
    onOpen();
  };
  const openModalNewTask = (): void => {
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
          start: new Date(event.start),
          end: new Date(event.start),
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
    onClose();
  };
  const moveUp = (task: HRTask): void => {
    const movedTasks = [...tasks];
    const idx = movedTasks.findIndex((x) => x.id === task.id);
    const tmp = movedTasks[idx];
    movedTasks[idx] = movedTasks[idx - 1];
    movedTasks[idx - 1] = tmp;
    setTasks(movedTasks);
  };
  const moveDown = (task: HRTask): void => {
    const movedTasks = [...tasks];
    const idx = movedTasks.findIndex((x) => x.id === task.id);
    const tmp = movedTasks[idx];
    movedTasks[idx] = movedTasks[idx + 1];
    movedTasks[idx + 1] = tmp;
    setTasks(movedTasks);
  };
  const handleDeleteTask = (taskId: string): void => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    onClose();
  };

  const handleSubmit = async (): Promise<void> => {
    getModifyHRTableMutation(event.id, {
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
    });
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
    return <Box mt={['1rem', null, 0]}>{children}</Box>;
  };

  return (
    <Layout>
      <LinkButton
        width={['100%', null, '45%']}
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
          text="Mentés"
          onClick={handleSubmit}
        />
        <Button
          width={['100%', null, '45%']}
          text="Új feladat"
          onClick={openModalNewTask}
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
                <Input
                  mb={['1rem', null, '0']}
                  value={newTask?.name}
                  onChange={(e: React.FormEvent): void =>
                    setNewTaskName((e.target as HTMLInputElement).value)
                  }
                />
                <Box gridColumn="1 / -1">Idősávok</Box>
              </Grid>
              {(newTask?.segments || []).map((s) => (
                <Grid
                  gridTemplateColumns={['1fr', null, '1fr 1fr']}
                  rowGap={['0', null, '1rem']}
                  mt={['0', null, '1rem']}
                  borderTop="solid 1px black"
                  key={s.id}
                >
                  <Label>Kezdés</Label>
                  <Box>
                    <DatePicker
                      name="segmentStart"
                      selected={getNewSegmentProp(s.id, 'start')}
                      onChange={(date: Date): void =>
                        setNewSegmentProp(s.id, 'start', date)
                      }
                      dateFormat="yyyy.MM.dd. HH:mm"
                      locale="hu"
                      showTimeSelect
                      renderCustomHeader={datePickerCustomHeader}
                      timeCaption="Időpont"
                    />
                  </Box>
                  <Label>Vége</Label>
                  <Box>
                    <DatePicker
                      name="segmentEnd"
                      selected={getNewSegmentProp(s.id, 'end')}
                      onChange={(date: Date): void =>
                        setNewSegmentProp(s.id, 'end', date)
                      }
                      dateFormat="yyyy.MM.dd. HH:mm"
                      locale="hu"
                      showTimeSelect
                      renderCustomHeader={datePickerCustomHeader}
                      timeCaption="Időpont"
                    />
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
                    text="X"
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
                  text="Mentés"
                  onClick={handleNewTask}
                />
                <Button
                  width={['100%', null, '45%']}
                  text="Törlés"
                  backgroundColor="red.500"
                  mt={[4, null, 0]}
                  onClick={(): void => {
                    handleDeleteTask(newTask?.id);
                  }}
                />
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
HRTableNewPage.defaultProps = {
  location: undefined,
};
