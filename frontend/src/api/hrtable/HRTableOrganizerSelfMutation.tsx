import { FetchResult, gql, MutationResult, useMutation } from '@apollo/client';

import { MutationProps } from '../../interfaces';

export const hrtableRegisterMutation = gql`
  mutation e_hrtableRegisterMutation($hrSegmentId: String!, $id: String!) {
    organizer_registerToHRTask(hrSegmentId: $hrSegmentId, id: $id)
  }
`;

export const useHRTableRegisterMutation = ({
  onCompleted,
  onError,
  refetchQueries,
}: MutationProps): [
  (hrSegmentId: string, id: string) => Promise<FetchResult>,
  MutationResult,
] => {
  const [mutation, mutationResults] = useMutation(hrtableRegisterMutation, {
    onCompleted,
    onError,
    refetchQueries,
  });

  const getMutation = (
    hrSegmentId: string,
    id: string,
  ): Promise<FetchResult> => {
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

export const useHRTableUnRegisterMutation = ({
  onCompleted,
  onError,
  refetchQueries,
}: MutationProps): [
  (hrSegmentId: string, id: string) => Promise<FetchResult>,
  MutationResult,
] => {
  const [mutation, mutationResults] = useMutation(hrtableUnRegisterMutation, {
    onCompleted,
    onError,
    refetchQueries,
  });

  const getMutation = (
    hrSegmentId: string,
    id: string,
  ): Promise<FetchResult> => {
    return mutation({
      variables: {
        hrSegmentId,
        id,
      },
    });
  };
  return [getMutation, mutationResults];
};
