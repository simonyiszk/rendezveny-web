import { gql, OperationVariables, QueryResult, useQuery } from '@apollo/client';

import { Log } from '../../../interfaces';

export const logGetAllQuery = gql`
  query logGetAll {
    logs_getAll {
      nodes {
        id
        issuerId
        type
        at
        query
        args
        result
      }
    }
  }
`;
interface QueryResultL {
  logs_getAll: {
    nodes: Log[];
  };
}
export const useLogGetAllQuery = (
  cb: (data: QueryResultL) => void,
): QueryResult<QueryResultL, OperationVariables> => {
  const getQuery = useQuery<QueryResultL>(logGetAllQuery, {
    onCompleted: cb,
  });
  return getQuery;
};
