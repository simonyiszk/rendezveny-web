/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const loginWithLocalIdentityMutation = gql`
  mutation loginMutation($username: String!, $password: String!) {
    login_withLocalIdentity(username: $username, password: $password) {
      access
      refresh
      role
      memberships {
        club {
          id
          name
        }
        role
      }
    }
  }
`;
