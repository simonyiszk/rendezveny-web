import 'react-datepicker/dist/react-datepicker.css';

import { gql, useApolloClient, useQuery } from '@apollo/client';
import {
  Box,
  Flex,
  Grid,
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
} from '@chakra-ui/core';
import { getMonth, getYear } from 'date-fns';
import hu from 'date-fns/locale/hu';
import { PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import Button from '../../../components/Button';
import EventSection from '../../../components/EventSection';
import HRTableComp from '../../../components/HRTableComp';
import { Layout } from '../../../components/Layout';
import {
  Event,
  EventOrganizer,
  HRSegment,
  HRTable,
  HRTask,
} from '../../../interfaces';
import { useEventGetHRTableQuery } from '../../../utils/api/hrtable/HRGetTableQuery';
import {
  useCreateHRTableMutation,
  useModifyHRTableMutation,
} from '../../../utils/api/hrtable/HRModifyTableMutation';
import {
  usehrtableRegisterMutation,
  usehrtableUnRegisterMutation,
} from '../../../utils/api/hrtable/HRTableOrganizerSelfMutation';
import { useEventTokenMutation } from '../../../utils/api/token/EventsGetTokenMutation';

registerLocale('hu', hu);

interface PageState {
  event: Event;
  hrTable: HRTable;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

export default function HRTablePage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state);
  const { event, hrTable } = state;
  console.log(hrTable);
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newId, setNewId] = useState(0);
  const [newTask, setNewTask] = useState<HRTask>();

  const [
    getCreateHRTableMutation,
    _getCreateHRTableMutation,
  ] = useCreateHRTableMutation();
  const [
    getModifyHRTableMutation,
    _getModifyHRTableMutation,
  ] = useModifyHRTableMutation();

  useEffect(() => {
    const fetchEventData = async () => {
      if (!hrTable) {
        await getCreateHRTableMutation(event.id);
        console.log('HR Table successfully created');
      }
    };
    fetchEventData();
  }, [event?.id]);

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
  const handleAddNewSegment = () => {
    console.log(newTask);
    setNewTask({
      ...newTask,
      segments: [
        ...newTask?.segments,
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
  const getNewSegmentProp = (segmentId: string, prop: string): any => {
    return newTask?.segments.filter((s) => s.id === segmentId)[0][prop];
  };
  const setNewSegmentProp = (
    segmentId: string,
    prop: string,
    value: any,
  ): void => {
    setNewTask({
      ...newTask,
      segments: newTask?.segments.map((s) => {
        if (s.id !== segmentId) return s;
        return { ...s, [prop]: value };
      }),
    });
  };

  const handleNewTask = () => {
    setTasks([
      ...tasks.filter((t) => t.id !== newTask?.id),
      {
        id: newTask?.id,
        name: newTask?.name,
        segments: newTask?.segments,
        isLocked: false,
      } as HRTask,
    ]);
    onClose();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    onClose();
  };

  const handleSubmit = async () => {
    getModifyHRTableMutation(event.id, {
      isLocked: hrTable.isLocked ?? false,
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
            } as HRSegment;
          }),
        } as HRTask;
      }),
    } as HRTable);
  };

  return (
    <Layout>
      <HRTableComp
        hrtasks={tasks}
        hredit={openModalLoadTask}
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
                  onChange={(e) => setNewTaskName(e.target.value)}
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
                      onChange={(date) =>
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
                      onChange={(date) => setNewSegmentProp(s.id, 'end', date)}
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
                    onChange={(e) =>
                      setNewSegmentProp(
                        s.id,
                        'isRequired',
                        e.target.value === 'Igen',
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
                    onClick={() => handleDeleteNewSegment(s.id)}
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
                  onClick={() => handleDeleteTask(newTask?.id)}
                />
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
const Label = ({ children }): JSX.Element => {
  return <Box mt={['1rem', null, 0]}>{children}</Box>;
};
