/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const usersGetAllQuery = gql`
  query usersGetAll {
    users_getAll {
      nodes {
        id
        name
      }
    }
  }
`;
