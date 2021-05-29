/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const profileGetSelfQuery = gql`
  query profileGetSelfQuery {
    users_getSelf {
      id
      name
      clubMemberships {
        nodes {
          role
          club {
            id
            name
          }
        }
      }
    }
  }
`;

export const profileGetNameQuery = gql`
  query profileGetNameQuery {
    users_getSelf {
      id
      name
    }
  }
`;
