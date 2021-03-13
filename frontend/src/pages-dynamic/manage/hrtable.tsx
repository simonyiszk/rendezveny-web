import { useApolloClient } from '@apollo/client';
import { Box, Flex, Heading, useDisclosure } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import { useEventGetHRTableQuery } from '../../api/hrtable/HRGetTableQuery';
import {
  useHRTableRegisterMutation,
  useHRTableUnRegisterMutation,
} from '../../api/hrtable/HRTableOrganizerSelfMutation';
import { useEventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { useProfileGetNameQuery } from '../../api/profile/UserGetSelfQuery';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../api/token/EventsGetTokenMutation';
import Button from '../../components/control/Button';
import LinkButton from '../../components/control/LinkButton';
import HRTableComp from '../../components/hrtable/HRTableComp';
import { Layout } from '../../components/layout/Layout';
import InfoModal from '../../components/util/InfoModal';
import Loading from '../../components/util/Loading';
import {
  Event,
  EventOrganizer,
  HRTable,
  OrganizerWorkingHours,
} from '../../interfaces';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';
import useToastService from '../../utils/services/ToastService';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location?: PageProps<null, null, PageState>['location'];
  uniqueName?: string;
}

export default function HRTablePage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location?.state || (typeof history === 'object' && history.state) || {};
  const { event } = state as PageState;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [hrTable, setHRTable] = useState<HRTable>();
  const [organizer, setOrganizer] = useState<EventOrganizer>();
  const [signUps, setSignUps] = useState<string[]>([]);
  const [signOffs, setSignOffs] = useState<string[]>([]);

  const {
    called: getSelfNameCalled,
    loading: getSelfNameLoading,
    data: getSelfNameData,
  } = useProfileGetNameQuery();

  const [
    getHRTable,
    {
      called: getHRTableCalled,
      loading: getHRTableLoading,
      error: getHRTableError,
      data: getHRTableData,
    },
  ] = useEventGetHRTableQuery((queryData) => {
    setOrganizer(queryData.events_getOne.selfRelation.organizer);
    setHRTable(queryData.events_getOne.hrTable);
    setSignUps([]);
    setSignOffs([]);
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
    getHRTable({ variables: { id: queryData.events_getOne.id } });
  });

  const client = useApolloClient();
  const [
    getEventTokenMutationID,
    { error: eventTokenMutationErrorID },
  ] = useEventTokenMutationID(client, () => {
    getHRTable({ variables: { id: event.id } });
  });
  const [
    getEventTokenMutationUN,
    { error: eventTokenMutationErrorUN },
  ] = useEventTokenMutationUN(client, () => {
    getCurrentEvent({ variables: { uniqueName } });
  });

  const makeToast = useToastService();

  const [getRegisterMutation] = useHRTableRegisterMutation({
    onCompleted: () => {},
    onError: (error) => {
      makeToast('Hiba', true, error.message);
    },
    refetchQueries: () => {},
  });
  const [getUnRegisterMutation] = useHRTableUnRegisterMutation({
    onCompleted: () => {},
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
    (getCurrentEventCalled && getCurrentEventLoading) ||
    !getHRTableCalled ||
    getHRTableLoading ||
    !getSelfNameCalled ||
    getSelfNameLoading
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenMutationErrorID ||
    eventTokenMutationErrorUN ||
    getCurrentEventError ||
    getHRTableError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/manage');
    }
    return <Box>Error</Box>;
  }

  const signUpCb = (segmentId: string): void => {
    if (signUps.includes(segmentId))
      setSignUps(signUps.filter((s) => s !== segmentId));
    else setSignUps([...signUps, segmentId]);
  };
  const signOffCb = (segmentId: string): void => {
    if (signOffs.includes(segmentId))
      setSignOffs(signOffs.filter((s) => s !== segmentId));
    else setSignOffs([...signOffs, segmentId]);
  };
  const handleCancel = (): void => {
    setSignUps([]);
    setSignOffs([]);
  };
  const handleSubmit = async (): Promise<void> => {
    if (organizer) {
      await Promise.all(
        signOffs.map((s) => getUnRegisterMutation(s, organizer.id)),
      );
      await Promise.all(
        signUps.map((s) => getRegisterMutation(s, organizer.id)),
      );
      getHRTable({
        variables: { id: event?.id ?? getCurrentEventData?.events_getOne.id },
      });
      makeToast('Sikeres mentés');
    }
  };

  const getEmptySegmentCount = (): [number, number] => {
    return (hrTable?.tasks ?? []).reduce(
      (acc, curr) => {
        const res = curr.segments.reduce(
          (acc2, curr2) => {
            const remainingSlotCount = curr2.capacity - curr2.organizers.length;
            if (curr2.isRequired)
              return [acc2[0] + remainingSlotCount, acc2[1]];
            return [acc2[0], acc2[1] + remainingSlotCount];
          },
          [0, 0],
        );
        return [acc[0] + res[0], acc[1] + res[1]];
      },
      [0, 0],
    );
  };

  const getHoursByUsers = (): OrganizerWorkingHours[] => {
    const owhObject = (hrTable?.tasks ?? [])
      .reduce((accTask, currTask) => {
        const res = currTask.segments
          .filter((s) => s.organizers.length > 0)
          .reduce((accSegment, currSegment) => {
            const organizerMinutes = currSegment.organizers.map((o) => {
              return {
                organizer: { id: o.userId, name: o.name },
                hours:
                  Math.round(
                    (new Date(currSegment.end).getTime() -
                      new Date(currSegment.start).getTime()) /
                      1000 /
                      60,
                  ) / 60,
              } as OrganizerWorkingHours;
            });
            return [...accSegment, ...organizerMinutes];
          }, [] as OrganizerWorkingHours[]);
        return [...accTask, ...res];
      }, [] as OrganizerWorkingHours[])
      .reduce((accOwh, currOwh) => {
        return {
          ...accOwh,
          [currOwh.organizer.id]: {
            organizer: currOwh.organizer,
            hours: (accOwh[currOwh.organizer.id]?.hours ?? 0) + currOwh.hours,
          },
        };
      }, {} as Record<string, OrganizerWorkingHours>);
    return (Object.values(owhObject) as OrganizerWorkingHours[]).sort(
      (a, b) => b.hours - a.hours,
    );
  };

  if (getHRTableCalled && !getHRTableData?.events_getOne.hrTable) {
    return (
      <Layout>
        <Heading fontSize="3xl" textAlign="center">
          Nincs elérhető HR tábla
        </Heading>
        <ProtectedComponent accessText={['chief']}>
          <Flex justifyContent="center" mt={4}>
            <LinkButton
              width={['100%', null, '45%']}
              text="Létrehozás"
              to={`/manage/${
                event?.uniqueName ??
                getCurrentEventData?.events_getOne.uniqueName
              }/hrtable/edit`}
              state={{
                event: event ?? getCurrentEventData?.events_getOne,
              }}
            />
          </Flex>
        </ProtectedComponent>
      </Layout>
    );
  }

  const emptySegmentCount = getEmptySegmentCount();
  return (
    <Layout>
      <ProtectedComponent accessText={['chief']}>
        <Flex
          justifyContent={['center', null, 'space-between']}
          flexDir={['column', null, 'row']}
          mt={4}
        >
          <Button
            width={['100%', null, '45%']}
            mb={[4, null, 0]}
            text="Statisztika"
            onClick={onOpen}
          />
          <LinkButton
            width={['100%', null, '45%']}
            text="Szerkesztés"
            to={`/manage/${
              event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
            }/hrtable/edit`}
            state={{
              event: event ?? getCurrentEventData?.events_getOne,
              hrTable,
            }}
          />
        </Flex>
      </ProtectedComponent>
      <Heading fontSize="3xl" mt={4}>
        HR Tábla
      </Heading>
      <HRTableComp
        hrtasks={hrTable?.tasks ?? []}
        hrcb={{ signUps, signOffs, signUpCb, signOffCb }}
        ownSegmentIds={organizer?.hrSegmentIds ?? []}
        user={getSelfNameData?.users_getSelf}
      />
      <Flex
        justifyContent={['center', null, 'space-between']}
        flexDir={['column', null, 'row']}
        mt={4}
      >
        <Button
          width={['100%', null, '45%']}
          order={[1, null, 0]}
          text="Mégse"
          backgroundColor="gray.300"
          mt={[4, null, 0]}
          onClick={handleCancel}
        />
        <Button
          width={['100%', null, '45%']}
          text="Mentés"
          onClick={handleSubmit}
        />
      </Flex>

      <InfoModal isOpen={isOpen} onClose={onClose} title="Statisztika">
        <Box>
          <Box mb={4}>
            <Box fontWeight="bold">Üres helyek</Box>
            <Box>Kötelező: {emptySegmentCount[0]}</Box>
            <Box>Opcionális: {emptySegmentCount[1]}</Box>
          </Box>
          <Box>
            <Box fontWeight="bold">Feltöltött helyek</Box>
            {getHoursByUsers().map((wh) => (
              <Box key={wh.organizer.id}>
                {wh.organizer.name} - {wh.hours} óra
              </Box>
            ))}
          </Box>
        </Box>
      </InfoModal>
    </Layout>
  );
}
HRTablePage.defaultProps = {
  location: undefined,
  uniqueName: undefined,
};
