/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const eventGetHRTableQuery = gql`
  query e_eventGetHRTable($id: String!) {
    events_getOne(id: $id) {
      id
      name
      hrTable {
        id
        isLocked
        tasks {
          id
          name
          isLocked
          segments {
            id
            start
            end
            isLocked
            isRequired
            capacity
            organizers {
              userId
              name
            }
          }
        }
      }
      selfRelation {
        userId
        organizer {
          id
          hrSegmentIds
        }
      }
    }
  }
`;
