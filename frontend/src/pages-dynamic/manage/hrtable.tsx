import { useApolloClient } from '@apollo/client';
import { Box, Flex, useToast } from '@chakra-ui/core';
import { RouteComponentProps } from '@reach/router';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import HRTableComp from '../../components/HRTableComp';
import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import Loading from '../../components/Loading';
import { Event, EventOrganizer, HRTable } from '../../interfaces';
import { useEventGetHRTableQuery } from '../../utils/api/hrtable/HRGetTableQuery';
import {
  useHRTableRegisterMutation,
  useHRTableUnRegisterMutation,
} from '../../utils/api/hrtable/HRTableOrganizerSelfMutation';
import { useEventGetInformationQuery } from '../../utils/api/index/EventsGetInformation';
import { useProfileGetNameQuery } from '../../utils/api/profile/UserGetSelfQuery';
import {
  useEventTokenMutationID,
  useEventTokenMutationUN,
} from '../../utils/api/token/EventsGetTokenMutation';

interface PageState {
  event: Event;
}
interface Props extends RouteComponentProps {
  location: PageProps<null, null, PageState>['location'];
  uniqueName: string;
}

export default function HRTablePage({
  location,
  uniqueName,
}: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state) || {};
  const { event } = state;

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
    (getHRTableCalled && getHRTableLoading) ||
    (getSelfNameCalled && getSelfNameLoading)
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

  if (getHRTableCalled && !getHRTableData?.events_getOne.hrTable) {
    if (typeof window !== 'undefined') {
      navigate(
        `/manage/${
          event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
        }/hrtable/new`,
        {
          state: { event: event ?? getCurrentEventData?.events_getOne },
        },
      );
    }
    return <div>Loading.</div>;
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

  return (
    <Layout>
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
          text="Mentés"
          onClick={handleSubmit}
        />
        <LinkButton
          width={['100%', null, '45%']}
          text="Szerkesztés"
          to={`/manage/${
            event?.uniqueName ?? getCurrentEventData?.events_getOne.uniqueName
          }/hrtable/new`}
          state={{
            event: event ?? getCurrentEventData?.events_getOne,
            hrTable,
          }}
        />
      </Flex>
    </Layout>
  );
}
