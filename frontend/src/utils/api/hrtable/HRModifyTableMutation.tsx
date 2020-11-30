import { gql, useMutation } from '@apollo/client';

import { HRTable } from '../../../interfaces';

export const createHRTableMutation = gql`
  mutation e_createHRTableMutation($id: String!) {
    events_createHRTable(id: $id) {
      id
      isLocked
    }
  }
`;

export const useCreateHRTableMutation = () => {
  const [mutation, mutationResults] = useMutation(createHRTableMutation);

  const getMutation = (id: string) => {
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

export const useModifyHRTableMutation = () => {
  const [mutation, mutationResults] = useMutation(modifyHRTableMutation);

  const getMutation = (id: string, hrTable: HRTable) => {
    console.log('MUTATION', hrTable);
    return mutation({
      variables: {
        id,
        hrTable,
      },
    });
  };
  return [getMutation, mutationResults];
};
