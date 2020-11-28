import { gql, useMutation } from '@apollo/client';

export const hrtableRegisterMutation = gql`
  mutation e_hrtableRegisterMutation($hrSegmentId: String!, $id: String!) {
    organizer_registerToHRTask(hrSegmentId: $hrSegmentId, id: $id)
  }
`;

export const usehrtableRegisterMutation = () => {
  const [mutation, mutationResults] = useMutation(hrtableRegisterMutation);

  const getMutation = (hrSegmentId: string, id: string) => {
    return mutation({
      variables: {
        hrSegmentId,
        id,
      },
    });
  };
  return [getMutation, mutationResults];
};

export const hrtableUnRegisterMutation = gql`
  mutation e_hrtableUnRegisterMutation($hrSegmentId: String!, $id: String!) {
    organizer_unregisterFromHRTask(hrSegmentId: $hrSegmentId, id: $id)
  }
`;

export const usehrtableUnRegisterMutation = () => {
  const [mutation, mutationResults] = useMutation(hrtableUnRegisterMutation);

  const getMutation = (hrSegmentId: string, id: string) => {
    return mutation({
      variables: {
        hrSegmentId,
        id,
      },
    });
  };
  return [getMutation, mutationResults];
};
