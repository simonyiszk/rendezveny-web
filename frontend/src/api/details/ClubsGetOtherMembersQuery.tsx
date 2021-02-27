import {
  gql,
  OperationVariables,
  QueryResult,
  QueryTuple,
  useLazyQuery,
  useQuery,
} from '@apollo/client';

import { Membership } from '../../interfaces';

export const clubsGetOtherMembersQuery = gql`
  query clubsGetOtherMembersQuery {
    users_getSelf {
      clubMemberships(isManaged: true) {
        nodes {
          club {
            id
            name
            clubMemberships {
              nodes {
                user {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;
interface QueryResultL {
  users_getSelf: {
    clubMemberships: {
      nodes: Membership[];
    };
  };
}
export const useClubsGetOtherMembersQuery = (
  cb: (data: QueryResultL) => void,
): QueryResult<QueryResultL, OperationVariables> => {
  const getQuery = useQuery<QueryResultL>(clubsGetOtherMembersQuery, {
    onCompleted: cb,
  });
  return getQuery;
};

export const clubsGetClubMembersQuery = gql`
  query clubsGetClubMembersQuery($id: String!) {
    clubs_getOne(id: $id) {
      id
      clubMemberships {
        nodes {
          user {
            id
            name
          }
        }
      }
    }
  }
`;
interface QueryResultClubMembersL {
  clubs_getOne: {
    id: string;
    clubMemberships: {
      nodes: Membership[];
    };
  };
}
export const useClubsGetClubMembersQuery = (
  cb: (data: QueryResultClubMembersL) => void,
): QueryTuple<QueryResultClubMembersL, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResultClubMembersL>(
    clubsGetClubMembersQuery,
    {
      onCompleted: cb,
    },
  );
  return [getQuery, data];
};
