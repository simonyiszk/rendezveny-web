import { Box } from '@chakra-ui/react';
import { navigate } from 'gatsby';
import React from 'react';
import { useQuery } from 'urql';

import { logGetAllQuery } from '../api/logs/LogsGetAllQuery';
import { Layout } from '../components/layout/Layout';
import LogBox from '../components/sections/LogBox';
import Loading from '../components/util/Loading';
import { LogsGetAllResult } from '../interfaces';

export default function LogsPage(): JSX.Element {
  const [
    { data: getLogData, fetching: getLogFetch, error: getLogError },
  ] = useQuery<LogsGetAllResult>({
    query: logGetAllQuery,
  });

  if (getLogFetch) {
    return <Loading />;
  }
  if (getLogError) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <Box>Error</Box>;
  }

  const logs = getLogData ? getLogData.logs_getAll.nodes : [];
  return (
    <Layout>
      {logs.map((l) => (
        <LogBox key={l.id} log={l} />
      ))}
    </Layout>
  );
}
