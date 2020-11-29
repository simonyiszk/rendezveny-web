import { gql, useQuery } from '@apollo/client';
import { navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../components/Button';
import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import LogBox from '../components/LogBox';
import SectionHeader from '../components/SectionHeader';
import { Log } from '../interfaces';
import { useLogGetAllQuery } from '../utils/api/logs/LogsGetAllQuery';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

export default function LogsPage(): JSX.Element {
  const getEvents = useLogGetAllQuery((queryData) => {
    setAllLog(queryData.logs_getAll.nodes);
  });

  const [allLog, setAllLog] = useState<Log[]>([]);

  if (getEvents.error) {
    navigate('/');
    return <div>Error</div>;
  }

  return (
    <Layout>
      {allLog.map((l) => (
        <LogBox key={l.id} log={l} />
      ))}
    </Layout>
  );
}
