import { gql, useApolloClient, useMutation } from '@apollo/client';
import { navigate } from 'gatsby';
import React, { useState } from 'react';

import { Layout } from '../components/Layout';
import { useLoginMutation } from '../utils/api/LoginWithLocalIdentityMutation';

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
      <div style={{ margin: 'auto', padding: '100px' }}>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              name="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              name="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </Layout>
  );
}
/*
export const query = graphql`
  query {
    apiv1 {
      clubs_getAll {
        nodes {
          name
        }
      }
    }
  }
`;
*/
