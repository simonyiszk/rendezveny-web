import { useApolloClient } from '@apollo/client';
import { Box, Flex, Grid, Input } from '@chakra-ui/react';
import { navigate } from 'gatsby';
import React, { useState } from 'react';

import { useLoginMutation } from '../api/token/LoginWithLocalIdentityMutation';
import Button from '../components/control/Button';
import { Layout } from '../components/layout/Layout';

export default function LoginPage(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const client = useApolloClient();
  const [loginMutation] = useLoginMutation(client, () => {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    loginMutation(username, password);
  };

  return (
    <Layout>
      <Flex flexDir="column" alignItems="center">
        <Box as="form" onSubmit={handleSubmit} minWidth="50%">
          <Grid
            gridTemplateColumns={['1fr', null, '1fr 1fr']}
            rowGap={['0', null, '1rem']}
          >
            <Box>Felhasználónév</Box>

            <Input
              name="username"
              value={username}
              onChange={(e: React.FormEvent): void => {
                setUsername((e.target as HTMLInputElement).value);
              }}
            />
            <Box>Jelszó</Box>

            <Input
              name="password"
              type="password"
              value={password}
              onChange={(e: React.FormEvent): void => {
                setPassword((e.target as HTMLInputElement).value);
              }}
            />
          </Grid>
          <Flex justifyContent="center" mt={4}>
            <Button
              width={['100%', null, '45%']}
              text="Bejelentkezés"
              as="button"
              onClick={(): void => {}}
            />
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
}
