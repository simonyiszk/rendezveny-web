import { gql, useApolloClient, useQuery } from '@apollo/client';
import { Box } from '@chakra-ui/core';
import { PageProps } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
import HRTableComp from '../../components/HRTableComp';
import { Layout } from '../../components/Layout';
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

export default function HRTablePage({
  location: {
    state: { event },
  },
}: Props): JSX.Element {
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
    console.log(event.id);
  }, [event.id]);

  if (!hrTable || !organizer) return <div>Loading</div>;
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
        hrtable={hrTable}
        hrcb={{ signUps, signOffs, signUpCb, signOffCb }}
        ownSegmentIds={organizer?.hrSegmentIds ?? []}
      />
      <Button text="Mentés" onClick={handleSubmit} />
    </Layout>
  );
}
