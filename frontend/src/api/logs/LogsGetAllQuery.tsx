/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const logGetAllQuery = gql`
  query logGetAll {
    logs_getAll {
      nodes {
        id
        issuerId
        type
        at
        query
        args
        result
      }
    }
  }
`;
