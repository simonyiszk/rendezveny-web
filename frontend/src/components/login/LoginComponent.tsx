import { Box, Flex, Grid, Input } from '@chakra-ui/react';
import React, { useContext, useState } from 'react';
import { useMutation } from 'urql';

import { loginWithLocalIdentityMutation } from '../../api/token/LoginWithLocalIdentityMutation';
import { RoleContext } from '../../utils/services/RoleContext';
import useToastService from '../../utils/services/ToastService';
import { setAuthToken } from '../../utils/token/TokenContainer';
import Button from '../control/Button';
import { Layout } from '../layout/Layout';

export default function LoginComponent(): JSX.Element {
  const roleContext = useContext(RoleContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const makeToast = useToastService();

  const [, loginMutation] = useMutation(loginWithLocalIdentityMutation);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    loginMutation({ username, password }).then((res) => {
      if (res.error) {
        makeToast('Hiba', true, res.error.message);
      } else {
        setAuthToken(res.data.login_withLocalIdentity.access);
        if (roleContext.setSystemRelation)
          roleContext.setSystemRelation(
            res.data.login_withLocalIdentity.role,
            res.data.login_withLocalIdentity.memberships,
          );
        if (typeof window !== 'undefined') {
          window.location.reload();
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
