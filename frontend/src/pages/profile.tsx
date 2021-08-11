import { Box } from '@chakra-ui/react';
import { navigate } from 'gatsby';
import React, { useContext } from 'react';
import { useQuery } from 'urql';

import { profileGetSelfQuery } from '../api/profile/UserGetSelfQuery';
import { Layout } from '../components/layout/Layout';
import LoginComponent from '../components/login/LoginComponent';
import Loading from '../components/util/Loading';
import { ClubRole, UserGetSelfResult } from '../interfaces';
import { RoleContext } from '../utils/services/RoleContext';

export default function LogsPage(): JSX.Element {
  const roleContext = useContext(RoleContext);

  const [
    { data: getProfileData, fetching: getProfileFetch, error: getProfileError },
  ] = useQuery<UserGetSelfResult>({
    query: profileGetSelfQuery,
  });

  if (getProfileFetch) {
    return <Loading />;
  }

  if (getProfileError) {
    if (
      getProfileError?.message === '[GraphQL] Unauthorized to perform operation'
    ) {
      if (!roleContext.isLoggedIn) return <LoginComponent />;
      navigate('/');
    }
    return <div />;
  }
  return (
    <Layout>
      <Box fontSize="2rem" fontWeight="bold">
        {getProfileData?.users_getSelf.name}
      </Box>
      <Box mt={4}>Körök</Box>
      {getProfileData?.users_getSelf.clubMemberships.nodes.map((c) => (
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
