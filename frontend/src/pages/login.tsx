import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';

import { Layout } from '../components/Layout';
import { useLoginMutation } from '../utils/LoginMutation';
import { getToken } from '../utils/TokenContainer';

export default function LoginPage(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loginMutation, _] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginMutation(username, password);
    window.location.href = '/';
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
