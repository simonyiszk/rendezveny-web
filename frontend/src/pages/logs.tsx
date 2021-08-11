import { navigate } from 'gatsby';
import React, { useContext } from 'react';
import { useQuery } from 'urql';

import { logGetAllQuery } from '../api/logs/LogsGetAllQuery';
import { Layout } from '../components/layout/Layout';
import LoginComponent from '../components/login/LoginComponent';
import LogBox from '../components/sections/LogBox';
import Loading from '../components/util/Loading';
import { LogsGetAllResult } from '../interfaces';
import { RoleContext } from '../utils/services/RoleContext';

export default function LogsPage(): JSX.Element {
  const roleContext = useContext(RoleContext);

  const [
    { data: getLogData, fetching: getLogFetch, error: getLogError },
  ] = useQuery<LogsGetAllResult>({
    query: logGetAllQuery,
  });

  if (getLogFetch) {
    return <Loading />;
  }
  if (getLogError) {
    if (
      getLogError?.message === '[GraphQL] Unauthorized to perform operation'
    ) {
      if (!roleContext.isLoggedIn) return <LoginComponent />;
      navigate('/');
    }
    return <div />;
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
