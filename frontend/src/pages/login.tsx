import { gql, useQuery } from '@apollo/client';
import React from 'react';

import { Layout } from '../components/Layout';

const userQueryGQL = gql`
  query {
    clubs_getAll {
      nodes {
        name
      }
    }
  }
`;

export default function LoginPage(): JSX.Element {
  const { called, loading, error, data } = useQuery(userQueryGQL);
  if (called && loading) return <div>Loading</div>;

  // Show error message if lazy query fails
  if (error) return <div>{error.message}</div>;

  return (
    <Layout>
      <p>Please login</p>
      {data.clubs_getAll.nodes.map((c) => (
        <div>{c.name}</div>
      ))}
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
