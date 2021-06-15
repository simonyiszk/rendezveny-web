import { Box, Flex, Heading, useDisclosure } from '@chakra-ui/react';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'urql';

import { eventGetHRTableQuery } from '../../api/hrtable/HRGetTableQuery';
import {
  hrtableRegisterMutation,
  hrtableUnRegisterMutation,
} from '../../api/hrtable/HRTableOrganizerSelfMutation';
import { eventGetInformationQuery } from '../../api/index/EventsGetInformation';
import { profileGetSelfQuery } from '../../api/profile/UserGetSelfQuery';
import {
  eventsGetTokenMutationID,
  eventsGetTokenMutationUN,
  setEventTokenAndRole,
} from '../../api/token/EventsGetTokenMutation';
import Backtext from '../../components/control/Backtext';
import Button from '../../components/control/Button';
import LinkButton from '../../components/control/LinkButton';
import HRTableComp from '../../components/hrtable/HRTableComp';
import { Layout } from '../../components/layout/Layout';
import InfoModal from '../../components/util/InfoModal';
import Loading from '../../components/util/Loading';
import {
  Event,
  EventGetOneResult,
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

  const [
    { fetching: eventTokenIDFetch, error: eventTokenIDError },
    getEventTokenMutationID,
  ] = useMutation(eventsGetTokenMutationID);
  const [
    {
      data: eventTokenUNData,
      fetching: eventTokenUNFetch,
      error: eventTokenUNError,
    },
    getEventTokenMutationUN,
  ] = useMutation(eventsGetTokenMutationUN);

  const [
    {
      data: getCurrentEventData,
      fetching: getCurrentEventFetch,
      error: getCurrentEventError,
    },
  ] = useQuery<EventGetOneResult>({
    query: eventGetInformationQuery,
    variables: { uniqueName },
    pause: eventTokenUNData === undefined,
  });
  const eventData = event ?? getCurrentEventData?.events_getOne;

  const [
    { data: getHRTableData, fetching: getHRTableFetch, error: getHRTableError },
    refetchHRTable,
  ] = useQuery<EventGetOneResult>({
    query: eventGetHRTableQuery,
    variables: { id: eventData?.id },
    pause: eventData === undefined,
  });

  const [
    {
      data: getSelfNameData,
      fetching: getSelfNameFetch,
      error: getSelfNameError,
    },
  ] = useQuery({
    query: profileGetSelfQuery,
  });

  const hrTable = getHRTableData?.events_getOne.hrTable;
  const organizer = getHRTableData?.events_getOne.selfRelation.organizer;
  const [signUps, setSignUps] = useState<string[]>([]);
  const [signOffs, setSignOffs] = useState<string[]>([]);

  const makeToast = useToastService();
  const [, getRegisterMutation] = useMutation(hrtableRegisterMutation);
  const [, getUnRegisterMutation] = useMutation(hrtableUnRegisterMutation);

  useEffect(() => {
    if (event)
      getEventTokenMutationID({ id: event.id }).then((res) => {
        if (!res.error) {
          setEventTokenAndRole(res.data);
        }
      });
    else if (uniqueName)
      getEventTokenMutationUN({ uniqueName }).then((res) => {
        if (!res.error) {
          setEventTokenAndRole(res.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueName, event?.id]);

  if (
    eventTokenIDFetch ||
    eventTokenUNFetch ||
    getCurrentEventFetch ||
    (!event && !getCurrentEventData) ||
    getHRTableFetch ||
    getSelfNameFetch
  ) {
    return <Loading />;
  }

  if (
    !uniqueName ||
    eventTokenIDError ||
    eventTokenUNError ||
    getCurrentEventError ||
    getHRTableError ||
    getSelfNameError
  ) {
    if (typeof window !== 'undefined') {
      navigate('/');
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
        signOffs.map((s) =>
          getUnRegisterMutation({ hrSegmentId: s, id: organizer.id }).then(
            (res) => {
              if (res.error) {
                makeToast('Hiba', true, res.error.message);
              }
            },
          ),
        ),
      );
      await Promise.all(
        signUps.map((s) =>
          getRegisterMutation({ hrSegmentId: s, id: organizer.id }).then(
            (res) => {
              if (res.error) {
                makeToast('Hiba', true, res.error.message);
              }
            },
          ),
        ),
      );
      setSignUps([]);
      setSignOffs([]);
      refetchHRTable({ requestPolicy: 'cache-and-network' });
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

  if (!hrTable) {
    return (
      <Layout>
        <Backtext
          text="Vissza a rendezvény kezeléséhez"
          to={`/manage/${event?.uniqueName}`}
          state={{ event }}
        />
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
      <Backtext
        text="Vissza a rendezvény kezeléséhez"
        to={`/manage/${event?.uniqueName}`}
        state={{ event }}
      />
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
