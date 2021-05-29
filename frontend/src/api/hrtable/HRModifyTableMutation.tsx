/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

export const createHRTableMutation = gql`
  mutation e_createHRTableMutation($id: String!) {
    events_createHRTable(id: $id) {
      id
      isLocked
    }
  }
`;

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
            userId
          }
        }
      }
    }
  }
`;
