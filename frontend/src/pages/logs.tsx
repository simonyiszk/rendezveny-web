import { Box } from '@chakra-ui/react';
import { navigate } from 'gatsby';
import React from 'react';

import { useLogGetAllQuery } from '../api/logs/LogsGetAllQuery';
import { Layout } from '../components/layout/Layout';
import LogBox from '../components/sections/LogBox';
import Loading from '../components/util/Loading';

export default function LogsPage(): JSX.Element {
  const getLogs = useLogGetAllQuery();

  if (getLogs.called && getLogs.loading) {
    return <Loading />;
  }
  if (getLogs.error) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <Box>Error</Box>;
  }

  return (
    <Layout>
      {getLogs.data?.logs_getAll.nodes.map((l) => (
        <LogBox key={l.id} log={l} />
      ))}
    </Layout>
  );
}
