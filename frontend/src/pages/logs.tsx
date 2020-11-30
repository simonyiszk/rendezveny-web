import { Box } from '@chakra-ui/core';
import { navigate } from 'gatsby';
import React from 'react';

import { Layout } from '../components/Layout';
import Loading from '../components/Loading';
import LogBox from '../components/LogBox';
import { useLogGetAllQuery } from '../utils/api/logs/LogsGetAllQuery';

export default function LogsPage(): JSX.Element {
  const getLogs = useLogGetAllQuery();

  if (getLogs.called && getLogs.loading) {
    return <Loading />;
  }
  if (getLogs.error) {
    navigate('/');
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
