import { FetchResult, gql, MutationResult, useMutation } from '@apollo/client';

import { HRTable, MutationProps } from '../../interfaces';

export const createHRTableMutation = gql`
  mutation e_createHRTableMutation($id: String!) {
    events_createHRTable(id: $id) {
      id
      isLocked
    }
  }
`;

export const useCreateHRTableMutation = ({
  onCompleted,
  onError,
  refetchQueries,
}: MutationProps): [(id: string) => Promise<FetchResult>, MutationResult] => {
  const [mutation, mutationResults] = useMutation(createHRTableMutation, {
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

export const modifyHRTableMutation = gql`
  mutation e_modifyHRTableMutation($id: String!, $hrTable: HRTableInput!) {
    events_modifyHRTable(id: $id, hrTable: $hrTable) {
      id
      isLocked
      tasks {
        id
        name
        segments {
          id
          start
          end
          capacity
          isRequired
          organizers {
            email
          }
        }
      }
    }
  }
`;

export const useModifyHRTableMutation = ({
  onCompleted,
  onError,
  refetchQueries,
}: MutationProps): [
  (id: string, hrTable: HRTable) => Promise<FetchResult>,
  MutationResult,
] => {
  const [mutation, mutationResults] = useMutation(modifyHRTableMutation, {
    onCompleted,
    onError,
    refetchQueries,
  });

  const getMutation = (id: string, hrTable: HRTable): Promise<FetchResult> => {
    return mutation({
      variables: {
        id,
        hrTable,
      },
    });
  };
  return [getMutation, mutationResults];
};
