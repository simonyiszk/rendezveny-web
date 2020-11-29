import { gql, useQuery } from '@apollo/client';
import { Box } from '@chakra-ui/core';
import { navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';

import Button from '../components/Button';
import EventSection from '../components/EventSection';
import { Layout } from '../components/Layout';
import LinkButton from '../components/LinkButton';
import LogBox from '../components/LogBox';
import SectionHeader from '../components/SectionHeader';
import { ClubRole, User } from '../interfaces';
import { useProfileGetSelfQuery } from '../utils/api/profile/UserGetSelfQuery';
import ProtectedComponent from '../utils/protection/ProtectedComponent';

export default function LogsPage(): JSX.Element {
  const getEvents = useProfileGetSelfQuery();

  if (getEvents.error) {
    navigate('/');
    return <div>Error</div>;
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