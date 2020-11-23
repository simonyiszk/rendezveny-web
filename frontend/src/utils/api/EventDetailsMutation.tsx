import { gql, useMutation } from '@apollo/client';

export const eventDetailsMutation = gql`
  mutation e_eventDetailsMutation(
    $id: String!
    $organizerIds: [String!]
    $uniqueName: String!
    $registrationAllowed: Boolean!
  ) {
    events_modifyEvent(
      id: $id
      organizerIds: $organizerIds
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
  const [mutation, mutationResults] = useMutation(eventDetailsMutation, {
    onCompleted: (data) => {
      console.log('RECEIVED DATA', data);
    },
  });

  const getMutation = (
    id: string,
    organizerIds: string[],
    uniqueName: string,
    registrationAllowed: boolean,
  ) => {
    console.log('Submitted', id, organizerIds, uniqueName, registrationAllowed);
    return mutation({
      variables: {
        id,
        organizerIds,
        uniqueName,
        registrationAllowed,
      },
    });
  };
  return [getMutation, mutationResults];
};
