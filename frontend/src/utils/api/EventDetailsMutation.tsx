import { gql, useMutation } from '@apollo/client';

export const eventDetailsMutation = gql`
  mutation e_eventDetailsMutation(
    $id: String!
    $organizerIds: [String!]
    $chiefOrganizerIds: [String!]
    $uniqueName: String!
    $registrationAllowed: Boolean!
  ) {
    events_modifyEvent(
      id: $id
      organizerIds: $organizerIds
      chiefOrganizerIds: $chiefOrganizerIds
      uniqueName: $uniqueName
      registrationAllowed: $registrationAllowed
    ) {
      id
      uniqueName
      registrationAllowed
      relations(chiefOrganizer: false) {
        nodes {
          userId
        }
      }
    }
  }
`;

export const useEventDetailsMutation = () => {
  const [mutation, mutationResults] = useMutation(eventDetailsMutation);

  const getMutation = (
    id: string,
    organizerIds: string[],
    chiefOrganizerIds: string[],
    uniqueName: string,
    registrationAllowed: boolean,
  ) => {
    console.log(
      'SUBMITTED MUTATION',
      id,
      organizerIds,
      chiefOrganizerIds,
      uniqueName,
      registrationAllowed,
    );
    return mutation({
      variables: {
        id,
        organizerIds,
        chiefOrganizerIds,
        uniqueName,
        registrationAllowed,
      },
    });
  };
  return [getMutation, mutationResults];
};
