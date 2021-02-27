import {
  gql,
  OperationVariables,
  QueryResult,
  QueryTuple,
  useLazyQuery,
  useQuery,
} from '@apollo/client';

import { User } from '../../interfaces';

export const profileGetSelfQuery = gql`
  query profileGetSelfQuery {
    users_getSelf {
      id
      name
      clubMemberships {
        nodes {
          role
          club {
            id
            name
          }
        }
      }
    }
  }
`;
interface QueryResultL {
  users_getSelf: User;
}
export const useProfileGetSelfQuery = (
  cb?: (data: QueryResultL) => void,
): QueryResult<QueryResultL, OperationVariables> => {
  const getQuery = useQuery<QueryResultL>(profileGetSelfQuery, {
    onCompleted: cb,
  });
  return getQuery;
};
export const useProfileGetSelfQueryLazy = (
  cb?: (data: QueryResultL) => void,
): QueryTuple<QueryResultL, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResultL>(profileGetSelfQuery, {
    onCompleted: cb,
  });
  return [getQuery, data];
};

export const profileGetNameQuery = gql`
  query profileGetNameQuery {
    users_getSelf {
      id
      name
    }
  }
`;
interface QueryResultL {
  users_getSelf: User;
}
export const useProfileGetNameQuery = (
  cb?: (data: QueryResultL) => void,
): QueryResult<QueryResultL, OperationVariables> => {
  const getQuery = useQuery<QueryResultL>(profileGetSelfQuery, {
    onCompleted: cb,
  });
  return getQuery;
};
