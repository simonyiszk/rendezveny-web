import { Box, Flex, Grid, Input } from '@chakra-ui/react';
import { navigate } from 'gatsby';
import React, { useState } from 'react';
import { useMutation } from 'urql';

import { loginWithLocalIdentityMutation } from '../api/token/LoginWithLocalIdentityMutation';
import Button from '../components/control/Button';
import { Layout } from '../components/layout/Layout';
import useToastService from '../utils/services/ToastService';
import { setAuthToken, setRoleAndClubs } from '../utils/token/TokenContainer';

export default function LoginPage(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const makeToast = useToastService();

  const [_, loginMutation] = useMutation(loginWithLocalIdentityMutation);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    loginMutation({ username, password }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        setAuthToken(res.data.login_withLocalIdentity.access);
        setRoleAndClubs(
          res.data.login_withLocalIdentity.role,
          res.data.login_withLocalIdentity.memberships,
        );
        if (typeof window !== 'undefined') {
          navigate('/');
        }
      }
    });
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
