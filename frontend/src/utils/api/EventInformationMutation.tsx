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
    $chiefOrganizerIds: [String!]
    $isClosedEvent: Boolean!
    $capacity: Float!
    $uniqueName: String!
  ) {
    events_modifyEvent(
      id: $id
      name: $name
      start: $start
      end: $end
      registrationStart: $registrationStart
      registrationEnd: $registrationEnd
      place: $place
      chiefOrganizerIds: $chiefOrganizerIds
      isClosedEvent: $isClosedEvent
      capacity: $capacity
      uniqueName: $uniqueName
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
    chiefOrganizerIds: string[],
    isClosedEvent: boolean,
    capacity: number,
    uniqueName: string,
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
        chiefOrganizerIds,
        isClosedEvent,
        capacity,
        uniqueName,
      },
    });
  };
  return [getMutation, mutationResults];
};
