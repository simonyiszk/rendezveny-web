import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { User } from '../../interfaces';

export const usersGetAllQuery = gql`
  query usersGetAll {
    users_getAll {
      nodes {
        id
        name
      }
    }
  }
`;
interface QueryResult {
  users_getAll: {
    nodes: User[];
  };
}
export const useUsersGetAllQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getUsers, data] = useLazyQuery<QueryResult>(usersGetAllQuery, {
    onCompleted: cb,
  });
  return [getUsers, data];
};
