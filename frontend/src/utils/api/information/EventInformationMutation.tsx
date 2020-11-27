import { gql, useMutation } from '@apollo/client';

export const eventInformationMutation = gql`
  mutation e_eventInformationMutation(
    $id: String!
    $name: String!
    $start: DateTime!
    $end: DateTime!
    $registrationStart: DateTime!
    $registrationEnd: DateTime!
    $place: String!
    $organizerIds: [String!]
    $chiefOrganizerIds: [String!]
    $isClosedEvent: Boolean!
    $capacity: Float!
    $uniqueName: String!
    $hostingClubIds: [String!]
  ) {
    events_modifyEvent(
      id: $id
      name: $name
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
      hostingClubIds: $hostingClubIds
    ) {
      id
      name
      start
      end
      registrationStart
      registrationEnd
      place
      isClosedEvent
      capacity
      uniqueName
      relations(chiefOrganizer: true) {
        nodes {
          userId
        }
      }
      hostingClubs {
        id
      }
    }
  }
`;

export const useEventInformationMutation = () => {
  const [mutation, mutationResults] = useMutation(eventInformationMutation);

  const getMutation = (
    id: string,
    name: string,
    start: string,
    end: string,
    registrationStart: string,
    registrationEnd: string,
    place: string,
    organizerIds: string[],
    chiefOrganizerIds: string[],
    isClosedEvent: boolean,
    capacity: number,
    uniqueName: string,
    hostingClubIds: string[],
  ) => {
    return mutation({
      variables: {
        id,
        name,
        start,
        end,
        registrationStart,
        registrationEnd,
        place,
        organizerIds,
        chiefOrganizerIds,
        isClosedEvent,
        capacity,
        uniqueName,
        hostingClubIds,
      },
    });
  };
  return [getMutation, mutationResults];
};

export const eventCreateMutation = gql`
  mutation eventCreateMutation(
    $name: String!
    $start: DateTime!
    $end: DateTime!
    $registrationStart: DateTime!
    $registrationEnd: DateTime!
    $place: String!
    $chiefOrganizerIds: [String!]!
    $isClosedEvent: Boolean!
    $capacity: Float!
    $uniqueName: String!
    $hostingClubIds: [String!]!
  ) {
    events_addEvent(
      name: $name
      description: $name
      start: $start
      end: $end
      registrationStart: $registrationStart
      registrationEnd: $registrationEnd
      place: $place
      chiefOrganizerIds: $chiefOrganizerIds
      isClosedEvent: $isClosedEvent
      capacity: $capacity
      uniqueName: $uniqueName
      hostingClubIds: $hostingClubIds
    ) {
      id
      name
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

export const useEventCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(eventCreateMutation);

  const getMutation = (
    name: string,
    start: string,
    end: string,
    registrationStart: string,
    registrationEnd: string,
    place: string,
    chiefOrganizerIds: string[],
    isClosedEvent: boolean,
    capacity: number,
    uniqueName: string,
    hostingClubIds: string[],
  ) => {
    return mutation({
      variables: {
        name,
        start,
        end,
        registrationStart,
        registrationEnd,
        place,
        chiefOrganizerIds,
        isClosedEvent,
        capacity,
        uniqueName,
        hostingClubIds,
      },
    });
  };
  return [getMutation, mutationResults];
};