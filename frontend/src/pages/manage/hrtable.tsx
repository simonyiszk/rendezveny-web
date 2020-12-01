import { gql, useApolloClient, useQuery } from '@apollo/client';
import { Box, Flex } from '@chakra-ui/core';
import { navigate, PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
import HRTableComp from '../../components/HRTableComp';
import { Layout } from '../../components/Layout';
import LinkButton from '../../components/LinkButton';
import { Event, EventOrganizer, HRTable } from '../../interfaces';
import { useEventGetHRTableQuery } from '../../utils/api/hrtable/HRGetTableQuery';
import {
  usehrtableRegisterMutation,
  usehrtableUnRegisterMutation,
} from '../../utils/api/hrtable/HRTableOrganizerSelfMutation';
import { useEventTokenMutation } from '../../utils/api/token/EventsGetTokenMutation';

interface PageState {
  event: Event;
}
interface Props {
  location: PageProps<null, null, PageState>['location'];
}

export default function HRTablePage({ location }: Props): JSX.Element {
  const state =
    // eslint-disable-next-line no-restricted-globals
    location.state || (typeof history === 'object' && history.state);
  const { event } = state;
  const [getHRTable, _getHRTable] = useEventGetHRTableQuery((queryData) => {
    console.log('QUERYDATA', queryData);
    setOrganizer(queryData.events_getOne.selfRelation.organizer);
    setHRTable(queryData.events_getOne.hrTable);
    setSignUps([]);
    setSignOffs([]);
  });

  const client = useApolloClient();
  const [getEventTokenMutation, _getEventTokenMutation] = useEventTokenMutation(
    client,
  );
  const [
    getRegisterMutation,
    _getRegisterMutation,
  ] = usehrtableRegisterMutation();
  const [
    getUnRegisterMutation,
    _getUnRegisterMutation,
  ] = usehrtableUnRegisterMutation();

  const [hrTable, setHRTable] = useState<HRTable>();
  const [organizer, setOrganizer] = useState<EventOrganizer>();
  const [signUps, setSignUps] = useState<string[]>([]);
  const [signOffs, setSignOffs] = useState<string[]>([]);

  useEffect(() => {
    const fetchEventData = async () => {
      await getEventTokenMutation(event.id);
      getHRTable({ variables: { id: event.id } });
    };
    fetchEventData();
  }, [event?.id]);

  if (!organizer) return <div>Loading</div>;
  if (!hrTable) {
    if (typeof window !== 'undefined') {
      navigate('/manage/hrtable/new', { state: { event } });
    }
    return <div>Loading</div>;
  }
  console.log(hrTable);
  console.log(organizer);

  if (_getHRTable.error) {
    // navigate('/');
    console.log(_getHRTable.error);
    return <div>Error</div>;
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
  const handleSubmit = async () => {
    await Promise.all(
      signOffs.map((s) => getUnRegisterMutation(s, organizer.id)),
    );
    await Promise.all(signUps.map((s) => getRegisterMutation(s, organizer.id)));
    setSignUps([]);
    setSignOffs([]);
    console.log('DONE');
  };

  return (
    <Layout>
      <HRTableComp
        hrtasks={hrTable.tasks}
        hrcb={{ signUps, signOffs, signUpCb, signOffCb }}
        ownSegmentIds={organizer?.hrSegmentIds ?? []}
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
          to="/manage/hrtable/new"
          state={{ event, hrTable }}
        />
      </Flex>
    </Layout>
  );
}
