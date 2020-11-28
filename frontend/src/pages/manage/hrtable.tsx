import { Box } from '@chakra-ui/core';
import React, { useEffect, useState } from 'react';

import EventSection from '../../components/EventSection';
import HRTableComp from '../../components/HRTableComp';
import { Layout } from '../../components/Layout';
import { Event } from '../../interfaces';
import { useEventGetHRTableQuery } from '../../utils/api/hrtable/HRGetTableQuery';
/* TODO EVENT TOKEN FRISSITES */

export default function HistoryPage(): JSX.Element {
  const getHRTable = useEventGetHRTableQuery((queryData) => {
    console.log('QUERYDATA', queryData);
  });

  if (getHRTable.called && getHRTable.loading) return <div>Loading</div>;

  if (getHRTable.error) {
    // navigate('/');
    console.log(getHRTable.error);
    return <div>Error</div>;
  }
  console.log(getHRTable.data?.events_getCurrent);
  console.log('CL', getHRTable);
  return (
    <Layout>
      <HRTableComp hrtable={getHRTable.data?.events_getCurrent.hrTable} />
    </Layout>
  );
}
