/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const eventGetHistoryQuery = gql`
  query eventsGetHistory {
    organizedEvents: events_getAll(isOrganizerPast: true) {
      nodes {
        id
        name
        start
        end
        place
        selfRelation2 {
          userId
          email
          organizer {
            isChiefOrganizer
          }
          registration {
            id
            didAttend
          }
        }
      }
    }
    registeredEvents: events_getAll(isRegisteredPast: true) {
      nodes {
        id
        name
        start
        end
        place
        selfRelation2 {
          userId
          email
          organizer {
            isChiefOrganizer
          }
          registration {
            id
            didAttend
          }
        }
      }
    }
  }
`;
