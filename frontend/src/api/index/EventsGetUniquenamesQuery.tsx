/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const eventGetUniquenamesQuery = gql`
  query eventsGetUniquenames {
    events_getAll {
      nodes {
        id
        uniqueName
      }
    }
  }
`;
