/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const eventGetOrganizersQuery = gql`
  query e_eventGetOrganizers($id: String!) {
    events_getOne(id: $id) {
      id
      name
      description
      uniqueName
      start
      end
      registrationStart
      registrationEnd
      place
      isClosedEvent
      capacity
      registrationAllowed
      hostingClubs {
        id
        name
      }
      organizers: relations(chiefOrganizer: false) {
        nodes {
          userId
          name
        }
      }
      chiefOrganizers: relations(chiefOrganizer: true) {
        nodes {
          userId
          name
        }
      }
      relations {
        nodes {
          userId
          name
        }
      }
    }
  }
`;
