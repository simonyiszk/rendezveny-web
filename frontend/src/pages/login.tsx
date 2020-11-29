import { gql, useApolloClient, useMutation } from '@apollo/client';
import { Box, Flex, Grid, Input, Select } from '@chakra-ui/core';
import { navigate } from 'gatsby';
import React, { useState } from 'react';

import Button from '../components/Button';
import { Layout } from '../components/Layout';
import { useLoginMutation } from '../utils/api/token/LoginWithLocalIdentityMutation';

export default function LoginPage(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const client = useApolloClient();
  const [loginMutation, _] = useLoginMutation(client);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginMutation(username, password);
    navigate('/');
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" minWidth="50%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            <Box>Felhasználónév</Box>

            <Input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Box>Jelszó</Box>

            <Input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Flex justifyContent="center" mt={4}>
            <Button
              width={['100%', null, '45%']}
              text="Bejelentkezés"
              onClick={handleSubmit}
            />
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
}
