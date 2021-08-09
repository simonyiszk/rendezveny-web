/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const eventGetAllQuery = gql`
  query eventsGetAll {
    organizedEvents: events_getAll(isOrganizerUpcoming: true) {
      nodes {
        id
        name
        description
        place
        start
        end
        registrationStart
        registrationEnd
        uniqueName
        capacity
        alreadyRegistered
        registrationAllowed
        hostingClubs {
          id
          name
        }
      }
    }
    registeredEvents: events_getAll(isRegisteredUpcoming: true) {
      nodes {
        id
        name
        description
        place
        start
        end
        registrationStart
        registrationEnd
        uniqueName
        capacity
        alreadyRegistered
        registrationAllowed
        hostingClubs {
          id
          name
        }
      }
    }
    availableEvents: events_getAll(canRegisterToUpcoming: true) {
      nodes {
        id
        name
        description
        place
        start
        end
        registrationStart
        registrationEnd
        uniqueName
        capacity
        alreadyRegistered
        registrationAllowed
        hostingClubs {
          id
          name
        }
      }
    }
  }
`;
