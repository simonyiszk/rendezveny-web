/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const eventInformationMutation = gql`
  mutation e_eventInformationMutation(
    $id: String!
    $name: String!
    $description: String!
    $start: DateTime!
    $end: DateTime!
    $registrationStart: DateTime!
    $registrationEnd: DateTime!
    $place: String!
    $organizerIds: [String!]
    $chiefOrganizerIds: [String!]
    $isClosedEvent: Boolean
    $capacity: Float!
    $uniqueName: String!
    $registrationAllowed: Boolean!
    $hostingClubIds: [String!]
  ) {
    events_modifyEvent(
      id: $id
      name: $name
      description: $description
      start: $start
      end: $end
      registrationStart: $registrationStart
      registrationEnd: $registrationEnd
      place: $place
      organizerIds: $organizerIds
      chiefOrganizerIds: $chiefOrganizerIds
      isClosedEvent: $isClosedEvent
      capacity: $capacity
      uniqueName: $uniqueName
      registrationAllowed: $registrationAllowed
      hostingClubIds: $hostingClubIds
    ) {
      id
      name
      description
      start
      end
      registrationStart
      registrationEnd
      place
      isClosedEvent
      capacity
      uniqueName
      registrationAllowed
      hostingClubs {
        id
      }
    }
  }
`;

export const eventCreateMutation = gql`
  mutation eventCreateMutation(
    $name: String!
    $description: String!
    $start: DateTime!
    $end: DateTime!
    $registrationStart: DateTime!
    $registrationEnd: DateTime!
    $place: String!
    $organizerIds: [String!]!
    $chiefOrganizerIds: [String!]!
    $isClosedEvent: Boolean!
    $capacity: Float!
    $uniqueName: String!
    $registrationAllowed: Boolean!
    $hostingClubIds: [String!]!
  ) {
    events_addEvent(
      name: $name
      description: $description
      start: $start
      end: $end
      registrationStart: $registrationStart
      registrationEnd: $registrationEnd
      place: $place
      organizerIds: $organizerIds
      chiefOrganizerIds: $chiefOrganizerIds
      isClosedEvent: $isClosedEvent
      capacity: $capacity
      uniqueName: $uniqueName
      registrationAllowed: $registrationAllowed
      hostingClubIds: $hostingClubIds
    ) {
      id
      name
      description
      start
      end
      registrationStart
      registrationEnd
      place
      isClosedEvent
      capacity
      uniqueName
    }
  }
`;

export const eventDeleteMutation = gql`
  mutation e_eventDeleteMutation($id: String!) {
    events_deleteEvent(id: $id)
  }
`;
