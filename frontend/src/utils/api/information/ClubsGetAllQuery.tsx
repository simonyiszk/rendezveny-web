import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Club } from '../../../interfaces';

export const clubsGetAllQuery = gql`
  query clubsGetAllQuery {
    clubs_getAll {
      nodes {
        id
        name
      }
    }
  }
`;
interface QueryResult {
  clubs_getAll: {
    nodes: Club[];
  };
}
export const useClubsGetAllQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(clubsGetAllQuery, {
    onCompleted: cb,
  });
  return [getQuery, data];
};
