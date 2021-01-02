import { Box } from '@chakra-ui/react';
import { navigate } from 'gatsby';
import React from 'react';

import { useProfileGetSelfQuery } from '../api/profile/UserGetSelfQuery';
import { Layout } from '../components/layout/Layout';
import Loading from '../components/util/Loading';
import { ClubRole } from '../interfaces';

export default function LogsPage(): JSX.Element {
  const getEvents = useProfileGetSelfQuery();

  if (getEvents.called && getEvents.loading) {
    return <Loading />;
  }

  if (getEvents.error) {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return <Box>Error</Box>;
  }
  return (
    <Layout>
      <Box fontSize="2rem" fontWeight="bold">
        {getEvents.data?.users_getSelf.name}
      </Box>
      <Box mt={4}>Körök</Box>
      {getEvents.data?.users_getSelf.clubMemberships.nodes.map((c) => (
        <Box key={c.club.id}>
          {c.club.name} (
          {c.role.toString() === ClubRole[ClubRole.MEMBER]
            ? 'Tag'
            : 'Körvezető'}
          )
        </Box>
      ))}
    </Layout>
  );
}
