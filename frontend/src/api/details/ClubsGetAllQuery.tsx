/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const clubsGetAllQuery = gql`
  query clubsGetAllQuery {
    clubs_getAll {
      nodes {
        id
        name
      }
    }
  }
`;
