import { FetchResult, gql, MutationResult, useMutation } from '@apollo/client';

import { MutationProps } from '../../../interfaces';

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

export const useEventInformationMutation = ({
  onCompleted,
  onError,
  refetchQueries,
}: MutationProps): [
  (
    id: string,
    name: string,
    description: string,
    start: string,
    end: string,
    registrationStart: string,
    registrationEnd: string,
    place: string,
    organizerIds: string[],
    chiefOrganizerIds: string[],
    isClosedEvent: boolean | undefined,
    capacity: number,
    uniqueName: string,
    registrationAllowed: boolean,
    hostingClubIds: string[] | undefined,
  ) => Promise<FetchResult>,
  MutationResult,
] => {
  const [mutation, mutationResults] = useMutation(eventInformationMutation, {
    onCompleted,
    onError,
    refetchQueries,
  });

  const getMutation = (
    id: string,
    name: string,
    description: string,
    start: string,
    end: string,
    registrationStart: string,
    registrationEnd: string,
    place: string,
    organizerIds: string[],
    chiefOrganizerIds: string[],
    isClosedEvent: boolean | undefined,
    capacity: number,
    uniqueName: string,
    registrationAllowed: boolean,
    hostingClubIds: string[] | undefined,
  ): Promise<FetchResult> => {
    return mutation({
      variables: {
        id,
        name,
        description,
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
        registrationAllowed,
        hostingClubIds,
      },
    });
  };
  return [getMutation, mutationResults];
};

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

export const useEventCreateMutation = ({
  onCompleted,
  onError,
  refetchQueries,
}: MutationProps): [
  (
    name: string,
    description: string,
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
    registrationAllowed: boolean,
    hostingClubIds: string[],
  ) => Promise<FetchResult>,
  MutationResult,
] => {
  const [mutation, mutationResults] = useMutation(eventCreateMutation, {
    onCompleted,
    onError,
    refetchQueries,
  });

  const getMutation = (
    name: string,
    description: string,
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
    registrationAllowed: boolean,
    hostingClubIds: string[],
  ): Promise<FetchResult> => {
    return mutation({
      variables: {
        name,
        description,
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
        registrationAllowed,
        hostingClubIds,
      },
    });
  };
  return [getMutation, mutationResults];
};

export const eventDeleteMutation = gql`
  mutation e_eventDeleteMutation($id: String!) {
    events_deleteEvent(id: $id)
  }
`;

export const useEventDeleteMutation = ({
  onCompleted,
  onError,
  refetchQueries,
}: MutationProps): [(id: string) => Promise<FetchResult>, MutationResult] => {
  const [mutation, mutationResults] = useMutation(eventDeleteMutation, {
    onCompleted,
    onError,
    refetchQueries,
  });

  const getMutation = (id: string): Promise<FetchResult> => {
    return mutation({
      variables: {
        id,
      },
    });
  };
  return [getMutation, mutationResults];
};
