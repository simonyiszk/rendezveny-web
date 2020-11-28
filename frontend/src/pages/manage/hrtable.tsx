import { Box } from '@chakra-ui/core';
import React, { useEffect, useState } from 'react';

import Button from '../../components/Button';
import EventSection from '../../components/EventSection';
import HRTableComp from '../../components/HRTableComp';
import { Layout } from '../../components/Layout';
import { Event } from '../../interfaces';
import { useEventGetHRTableQuery } from '../../utils/api/hrtable/HRGetTableQuery';
import {
  usehrtableRegisterMutation,
  usehrtableUnRegisterMutation,
} from '../../utils/api/hrtable/HRTableOrganizerSelfMutation';
/* TODO EVENT TOKEN FRISSITES */

export default function HistoryPage(): JSX.Element {
  const getHRTable = useEventGetHRTableQuery((queryData) => {
    console.log('QUERYDATA', queryData);
  });

  const [
    getRegisterMutation,
    _getRegisterMutation,
  ] = usehrtableRegisterMutation();
  const [
    getUnRegisterMutation,
    _getUnRegisterMutation,
  ] = usehrtableUnRegisterMutation();

  const [signUps, setSignUps] = useState<string[]>([]);
  const [signOffs, setSignOffs] = useState<string[]>([]);

  if (getHRTable.called && getHRTable.loading) return <div>Loading</div>;

  if (getHRTable.error) {
    // navigate('/');
    console.log(getHRTable.error);
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
      signOffs.map((s) =>
        getUnRegisterMutation(
          s,
          getHRTable.data?.events_getCurrent.selfRelation.organizer.id,
        ),
      ),
    );
    await Promise.all(
      signUps.map((s) =>
        getRegisterMutation(
          s,
          getHRTable.data?.events_getCurrent.selfRelation.organizer.id,
        ),
      ),
    );
    console.log('DONE');
  };

  return (
    <Layout>
      <HRTableComp
        hrtable={getHRTable.data?.events_getCurrent.hrTable}
        hrcb={{ signUps, signOffs, signUpCb, signOffCb }}
        ownSegmentIds={
          getHRTable.data?.events_getCurrent.selfRelation.organizer
            ?.hrSegmentIds ?? []
        }
      />
      <Button text="Mentés" onClick={handleSubmit} />
    </Layout>
  );
}
